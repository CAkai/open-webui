from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse

import requests
import aiohttp
import asyncio
import json
import logging

from pydantic import BaseModel


from apps.web.models.users import Users
from constants import ERROR_MESSAGES
from utils.utils import (
    decode_token,
    get_current_user,
    get_verified_user,
    get_admin_user,
)
from config import (
    SRC_LOG_LEVELS,
    UMC_BASE_URL,
)
from typing import List, Optional


import hashlib
from pathlib import Path

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["UMC"])

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.state.UMC_API_BASE_URLS = [UMC_BASE_URL]

app.state.MODELS = {
    "data": [
        {"id": "gpt-4", "name": "GPT-4", "external": False},
    ]
}


@app.middleware("http")
async def check_url(request: Request, call_next):
    response = await call_next(request)
    return response


class UrlsUpdateForm(BaseModel):
    urls: List[str]


class KeysUpdateForm(BaseModel):
    keys: List[str]


@app.get("/urls")
async def get_openai_urls(user=Depends(get_admin_user)):
    return {"UMC_API_BASE_URLS": app.state.UMC_API_BASE_URLS}


@app.post("/urls/update")
async def update_UMC_urls(form_data: UrlsUpdateForm, user=Depends(get_admin_user)):
    app.state.UMC_API_BASE_URLS = form_data.urls
    return {"UMC_API_BASE_URLS": app.state.UMC_API_BASE_URLS}


async def fetch_url(url, key):
    try:
        headers = {"Authorization": f"Bearer {key}"}
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                return await response.json()
    except Exception as e:
        # Handle connection error here
        log.error(f"Connection error: {e}")
        return None


def merge_models_lists(model_lists):
    log.info(f"merge_models_lists {model_lists}")
    merged_list = []

    for idx, models in enumerate(model_lists):
        if models is not None and "error" not in models:
            merged_list.extend(
                [
                    {**model, "urlIdx": idx}
                    for model in models
                    if "api.openai.com" not in app.state.UMC_API_BASE_URLS[idx]
                    or "gpt" in model["id"]
                ]
            )

    return merged_list


@app.get("/models")
@app.get("/models/{url_idx}")
async def get_models(url_idx: Optional[int] = None, user=Depends(get_current_user)):
    return app.state.MODELS


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(path: str, request: Request, user=Depends(get_verified_user)):
    idx = 0

    body = await request.body()
    # TODO: Remove below after gpt-4-vision fix from Open AI
    # Try to decode the body of the request from bytes to a UTF-8 string (Require add max_token to fix gpt-4-vision)
    try:
        body = body.decode("utf-8")
        body = json.loads(body)

        idx = app.state.MODELS[body.get("model")]["urlIdx"]

        # Check if the model is "gpt-4-vision-preview" and set "max_tokens" to 4000
        # This is a workaround until OpenAI fixes the issue with this model
        if body.get("model") == "gpt-4-vision-preview":
            if "max_tokens" not in body:
                body["max_tokens"] = 4000
            log.debug("Modified body_dict:", body)

        # Fix for ChatGPT calls failing because the num_ctx key is in body
        if "num_ctx" in body:
            # If 'num_ctx' is in the dictionary, delete it
            # Leaving it there generates an error with the
            # OpenAI API (Feb 2024)
            del body["num_ctx"]

        # Convert the modified body back to JSON
        body = json.dumps(body)
    except json.JSONDecodeError as e:
        log.error("Error loading request body into a dictionary:", e)

    url = app.state.UMC_API_BASE_URLS[idx]
    key = app.state.OPENAI_API_KEYS[idx]

    target_url = f"{url}/{path}"

    if key == "":
        raise HTTPException(status_code=401, detail=ERROR_MESSAGES.API_KEY_NOT_FOUND)

    headers = {}
    headers["Authorization"] = f"Bearer {key}"
    headers["Content-Type"] = "application/json"

    r = None

    try:
        r = requests.request(
            method=request.method,
            url=target_url,
            data=body,
            headers=headers,
            stream=True,
        )

        r.raise_for_status()

        # Check if response is SSE
        if "text/event-stream" in r.headers.get("Content-Type", ""):
            return StreamingResponse(
                r.iter_content(chunk_size=8192),
                status_code=r.status_code,
                headers=dict(r.headers),
            )
        else:
            response_data = r.json()
            return response_data
    except Exception as e:
        log.exception(e)
        error_detail = "Open WebUI: Server Connection Error"
        if r is not None:
            try:
                res = r.json()
                if "error" in res:
                    error_detail = f"External: {res['error']['message'] if 'message' in res['error'] else res['error']}"
            except:
                error_detail = f"External: {e}"

        raise HTTPException(
            status_code=r.status_code if r else 500, detail=error_detail
        )
