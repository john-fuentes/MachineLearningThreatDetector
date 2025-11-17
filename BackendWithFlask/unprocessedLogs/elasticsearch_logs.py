import hashlib
import json

from elasticsearch import helpers
from kafka import KafkaConsumer

from config import KAFKA_TOPIC_RAW_LOGS, KAFKA_BOOTSTRAP_SERVERS, elasticsearch_client

client = elasticsearch_client

def kafka_consumer_elasticsearch_raw_logs():
    consumer = KafkaConsumer(
        KAFKA_TOPIC_RAW_LOGS,
        bootstrap_servers = KAFKA_BOOTSTRAP_SERVERS,
        group_id = "elasticsearch_raw_logs",
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8"))
    )

    actions = []

    batch_max_size = 10

    for message in consumer:
        curr_log = message.value
        customer_id = curr_log.get("customer_id")
        vm_id = curr_log.get("vm_id")

        raw_text = json.dumps(curr_log, sort_keys=True)
        log_hash = hashlib.md5(raw_text.encode("utf-8")).hexdigest()
        action = {
            "_index": "unprocessed_logs",
            "_id": f"{customer_id}-{vm_id}-{log_hash}",
            "_source":{
                "customer_id": customer_id,
                "vm_id": vm_id,
                "log": curr_log,
                "timestamp": curr_log.get("@timestamp")
            }
        }
        #print(action)

        actions.append(action)

        #print(vm_id)

        if len(actions) >= batch_max_size:
            #print("Adding to elasticsearch raw logs")
            #print("Adding to elastic search")
            helpers.bulk(client, actions)
            actions = []

    if actions:
        helpers.bulk(client,actions)
