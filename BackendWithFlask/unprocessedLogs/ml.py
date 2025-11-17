from datetime import datetime, timezone
import hashlib
import json
import re
import joblib
import numpy as np
import pandas as pd
from kafka import KafkaProducer
from config import KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPIC_ML_RESULTS

model = joblib.load("isolation_forest_audit_model.pkl")
scaler = joblib.load("audit_scaler.pkl")

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    value_serializer=lambda value: json.dumps(value).encode("utf-8"),
)


def to_serializable(obj):
    if isinstance(obj, np.generic):
        return obj.item()
    if isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_serializable(i) for i in obj]
    return obj



def ml_prediction_process(key, now, vm_windows, window_size):
    logs = [msg for ts, msg in vm_windows[key]]
    if not logs:
        return

    parsed_logs = [parse_auditd_message(msg) for msg in logs]
    df = pd.DataFrame(parsed_logs)

    # Ensure required columns exist
    for col in ["pid", "uid", "syscall", "inode", "ouid", "ogid", "item", "comm", "exe", "name", "success"]:
        if col not in df.columns:
            df[col] = 0

    # Compute feature window (mirroring your training logic)
    window_start = now - window_size
    feat = {
        "num_events": [len(df)],
        "mean_syscall": [df["syscall"].mean() if "syscall" in df else 0],
        "mean_uid": [df["uid"].mean() if "uid" in df else 0],
        "fail_rate": [1 - df["success"].mean() if "success" in df else 0],
        "unique_comm": [df["comm"].nunique()],
        "unique_exe": [df["exe"].nunique()],
        "unique_files": [df["name"].nunique()],
    }

    feature_df = pd.DataFrame(feat)
    feat = to_serializable(feat)

    # Apply scaling before inference
    X_scaled = scaler.transform(feature_df)

    preds = model.predict(X_scaled)
    scores = model.decision_function(X_scaled)
    curr_time = datetime.now(timezone.utc).isoformat()

    result = {
        "customer_id": key[0],
        "vm_id": key[1],
        "score": float(scores[0]),
        "prediction": int(preds[0]),
        "features": feat,
        "raw_count": len(df),
        "timestamp": curr_time,
        "window_start": window_start.isoformat(),
    }


    kafka_key = f"{key[0]}-{key[1]}".encode("utf-8")
    producer.send(KAFKA_TOPIC_ML_RESULTS, key=kafka_key, value=result)
    # print(f"Sent ML result for {key}")



def parse_auditd_message(msg):
    text = msg.get("message", "")

    def extract(pattern, default=0):
        match = re.search(pattern, text)
        return int(match.group(1)) if match else default

    # Extract standard audit fields
    pid = extract(r"pid=(\d+)")
    uid = extract(r"uid=(\d+)")
    syscall = extract(r"syscall=(\d+)")
    inode = extract(r"inode=(\d+)")
    ouid = extract(r"ouid=(\d+)")
    ogid = extract(r"ogid=(\d+)")
    item = extract(r"item=(\d+)")

    comm_match = re.search(r"comm=\"([^\"]+)\"", text)
    exe_match = re.search(r"exe=\"([^\"]+)\"", text)
    name_match = re.search(r"name=\"([^\"]+)\"", text)

    comm = comm_match.group(1) if comm_match else "unknown"
    exe = exe_match.group(1) if exe_match else "unknown"
    name = name_match.group(1) if name_match else "unknown"

    success_flag = 1 if re.search(r"success=yes", text) else 0

    return {
        "pid": pid,
        "uid": uid,
        "syscall": syscall,
        "inode": inode,
        "ouid": ouid,
        "ogid": ogid,
        "item": item,
        "comm": comm,
        "exe": exe,
        "name": name,
        "success": success_flag,
    }