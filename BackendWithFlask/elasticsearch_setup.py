import logging

from config import elasticsearch_client

logger = logging.getLogger(__name__)

# Connection to Elasticsearch
client = elasticsearch_client

# --- Define mappings (schemas) ---
UNPROCESSED_LOGS_MAPPING = {
    "mappings": {
        "properties": {
            "customer_id": {"type": "keyword"},
            "vm_id": {"type": "keyword"},
            "log": {"type": "object"},
            "@timestamp": {"type": "date",
                          "format": "strict_date-option_time || epocH_millis"}
        }
    },
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
    }
}

PROCESSED_LOGS_MAPPING = {
    "mappings": {
        "properties": {
            "customer_id": {"type": "keyword"},
            "vm_id": {"type": "keyword"},
            "prediction": {"type": "integer"},
            "features": {"type": "object"},
            "raw_count": {"type": "integer"},
            "timestamp": {"type": "date",
                          "format": "strict_date-option_time || epocH_millis"}
        }
    },
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0
    }
}


def ensure_index(index_name, mapping):
    """Check if index exists; if not, create it with the given mapping."""
    if not client.indices.exists(index=index_name):
        logger.info(f"Creating index: {index_name}")
        client.indices.create(index=index_name, body=mapping)
    else:
        logger.info(f"Index already exists: {index_name}")


def setup_elasticsearch_indices():
    """Ensure required indices exist before starting Flask app."""
    ensure_index("unprocessed_logs", UNPROCESSED_LOGS_MAPPING)
    ensure_index("processed_logs_time_series", PROCESSED_LOGS_MAPPING)
    logger.info("✅ Elasticsearch indices are ready.")