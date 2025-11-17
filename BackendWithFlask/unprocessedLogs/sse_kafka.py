import queue
import json
import sys

from flask import request, Response, Blueprint
from kafka import KafkaConsumer

from config import KAFKA_TOPIC_RAW_LOGS, KAFKA_BOOTSTRAP_SERVERS
sse_blueprint = Blueprint("sse_blueprint", __name__)
subscribed_clients = {}

def kafka_consumer_thread_raw_logs_sse():
    consumer = KafkaConsumer(
        KAFKA_TOPIC_RAW_LOGS,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="raw_logs_group_sse",
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8"))
    )

    for message in consumer:
        curr_msg = message.value
        customer_id = curr_msg.get("customer_id")
        vm_id = curr_msg.get("vm_id")

        if not customer_id or not vm_id:
            continue

        key = (customer_id, vm_id)
        if key in subscribed_clients:
            try:
                subscribed_clients[key].put(curr_msg, block= False)
            except queue.Full:
                print("Dropped message")




@sse_blueprint.route("/stream")
def reading_logs():
    import sys, json, queue
    from flask import request, Response

    customer_id = request.args.get("customer_id")
    vm_id = request.args.get("vm_id")
    if not customer_id or not vm_id:
        return Response("Missing customer_id or vm_id", status=400)

    key = (customer_id, vm_id)
    if key not in subscribed_clients:
        subscribed_clients[key] = queue.Queue(maxsize=1000)

    def event_stream():
        yield 'data: {"status": "connected"}\n\n'
        sys.stdout.flush()
        try:
            while True:
                msg = subscribed_clients[key].get()
                yield f"data: {json.dumps(msg)}\n\n"
                sys.stdout.flush()
        except GeneratorExit:
            subscribed_clients.pop(key, None)

    # 👇 add CORS + streaming headers
    resp = Response(event_stream(), mimetype="text/event-stream")
    resp.headers.update({
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
    })
    return resp
