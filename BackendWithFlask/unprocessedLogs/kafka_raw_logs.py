import json
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta

from kafka import KafkaConsumer

from config import KAFKA_TOPIC_RAW_LOGS, KAFKA_BOOTSTRAP_SERVERS
from unprocessedLogs.ml import ml_prediction_process

vm_windows = defaultdict(deque)                   # each item: (ts: datetime, msg: dict)
window_size = timedelta(seconds=60)              # 5 minutes as timedelta
step_size = timedelta(seconds=30)                 # 1 minute as timedelta
last_eval = {}                                    # key -> datetime

def kafka_consumer_thread_raw_logs():
    consumer = KafkaConsumer(
        KAFKA_TOPIC_RAW_LOGS,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="raw_logs_group",
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    for message in consumer:
        curr_msg = message.value
        now = datetime.now(timezone.utc)

        customer_id = curr_msg.get("customer_id")
        vm_id = curr_msg.get("vm_id")
        if not customer_id or not vm_id:
            continue

        key = (customer_id, vm_id)

        # append current message with timestamp
        vm_windows[key].append((now, curr_msg))

        # evict anything older than the 5-minute window
        while vm_windows[key] and (now - vm_windows[key][0][0]) > window_size:
            vm_windows[key].popleft()

        # run ML at most once per step (e.g., every 60s) per VM
        if key not in last_eval or (now - last_eval[key]) >= step_size:
            # DEBUG: uncomment if needed
            # print(f"[DEBUG] invoking ML for {key} at {now.isoformat()} with {len(vm_windows[key])} msgs")
            ml_prediction_process(key, now, vm_windows, window_size)
            last_eval[key] = now