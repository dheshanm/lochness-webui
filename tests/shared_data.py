import json
import os

SHARED_DATA_FILE = "shared_test_data.json"

def save_shared_data(data: dict):
    with open(SHARED_DATA_FILE, "w") as f:
        json.dump(data, f)

def load_shared_data() -> dict:
    if os.path.exists(SHARED_DATA_FILE):
        with open(SHARED_DATA_FILE, "r") as f:
            return json.load(f)
    return {}
