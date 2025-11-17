from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from flask import Blueprint, jsonify, request

from config import elasticsearch_client

client = elasticsearch_client
logs_blueprint = Blueprint("logs_blueprint", __name__)

#API endpoint to get unprocessed logs based on vm and date and user

def get_unprocessed_logs(customer_id: str, vm_id: str, date:str, start_time:str, end_time:str,size: int = 1000):
    try:
        local_tz = ZoneInfo("America/New_York")

        # 1. Create naive datetime objects from the input strings
        naive_start = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %H:%M")
        naive_end = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %H:%M")

        # 2. Make them timezone-aware by attaching your local timezone
        aware_start = naive_start.replace(tzinfo=local_tz)
        aware_end = naive_end.replace(tzinfo=local_tz)
    except ValueError:
        return None

    query = {
        "query": {
            "bool" : {
                "must" : [
                    {"term" : {"customer_id" : customer_id}},
                    {"term" : {"vm_id": vm_id}},
                    {"range" : {"timestamp": {
                        "gte": aware_start.isoformat(),
                        "lt": aware_end.isoformat()
                    }}}
                ]
            }
        },
        "sort":[
            {"timestamp": {"order" : "desc"}}
        ]
    }

    response = client.search(
        index = "unprocessed_logs",
        body = query,
        size = size
    )
    #print(response)
    hits = response.get("hits", {}).get("hits", [])
    logs = [hit["_source"] for hit in hits]

    return logs

@logs_blueprint.route("/logs/unprocessed", methods=["GET"])
def get_processed():
    customer_id = request.args.get("customer_id")
    vm_id = request.args.get("vm_id")
    date = request.args.get("date")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    if not all([customer_id,vm_id, date, start_time, end_time]):
        return jsonify({"error": "Missing data"}), 400
    logs = get_unprocessed_logs(customer_id, vm_id, date, start_time, end_time)
    return jsonify(logs)