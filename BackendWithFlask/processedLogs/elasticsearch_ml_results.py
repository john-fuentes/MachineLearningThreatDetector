import json

from kafka import KafkaConsumer

from elasticsearch import helpers

from config import KAFKA_TOPIC_ML_RESULTS, KAFKA_BOOTSTRAP_SERVERS, elasticsearch_client

"""
message sample 
result = {
        "customer_id": key[0],
        "vm_id": key[1],
        "scores
        "prediction": int(preds[0]),
        "features": feat,
        "raw_count": len(df),
        "timestamp": curr_time
    }"""

client = elasticsearch_client

batch_max_size = 1

batch = []

def kafka_consumer_thread_processed_logs_elasticsearch():
    global batch
    consumer = KafkaConsumer(
        KAFKA_TOPIC_ML_RESULTS,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="processed_logs_elasticsearch",
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
    )

    try:
        for msg in consumer:


            doc = msg.value
            # print(f"[DEBUG] Received doc: {doc}")

            window_start = doc.get("window_start")
            timestamp = doc.get("timestamp")

            # Convert window_start (ISO string) into safe ID-friendly format
            # For example, "2025-11-02T19:45:00Z" → "20251102T194500"
            window_id = (
                window_start.replace("-", "")
                .replace(":", "")
                .replace("T", "")
                .split(".")[0]
                .replace("Z", "")
                if isinstance(window_start, str)
                else str(window_start)
            )

            # Prepare Elasticsearch document
            action = {
                "_index": "processed_logs_time_series",
                "_id": f"{doc['customer_id']}-{doc['vm_id']}-{window_id}",
                "_source": {
                    "customer_id": doc["customer_id"],
                    "vm_id": doc["vm_id"],
                    "score": doc["score"],
                    "prediction": doc["prediction"],
                    "features": doc["features"],
                    "raw_count": doc["raw_count"],
                    "timestamp": timestamp,
                    "window_start": window_start,
                },
            }

            batch.append(action)
            if len(batch) >= batch_max_size:
                helpers.bulk(client, batch)
                batch = []
    finally:
        if batch:
            helpers.bulk(client, batch)