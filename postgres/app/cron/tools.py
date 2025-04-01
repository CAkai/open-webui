

import backoff
import requests


@backoff.on_exception(
    backoff.expo,
    requests.exceptions.RequestException,
    max_tries=5,
    giveup=lambda e: e.response is not None and e.response.status_code < 500
)
def retry(url, data):
    response = requests.post(url, json=data, timeout=30000)
    response.raise_for_status()
    print(response.text)

x = {"comment": "cannot find wafer info?", "score": 2, "model": "textsql", "question": "How many wafers in DB?"}
#
# retry("http://192.168.0.13:8001/v1/api/pub/feedback" , x, 10)

response = requests.post("http://192.168.0.13:8001/v1/api/pub/feedback", json=x, timeout=30000)

print(response.text)