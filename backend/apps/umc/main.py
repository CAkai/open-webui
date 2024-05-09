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
        {"id": "umcgpt-4", "name": "UMCGPT-4", "external": False, "source": "umc"},
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


@app.get("/models")
@app.get("/models/{url_idx}")
async def get_models(url_idx: Optional[int] = None, user=Depends(get_current_user)):
    return app.state.MODELS


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(path: str, request: Request, user=Depends(get_verified_user)):
    body = await request.body()
    # TODO: Remove below after gpt-4-vision fix from Open AI
    # Try to decode the body of the request from bytes to a UTF-8 string (Require add max_token to fix gpt-4-vision)
    try:
        body = body.decode("utf-8")
        body = json.loads(body)

        # Convert the modified body back to JSON
        body = json.dumps(body)
    except json.JSONDecodeError as e:
        log.error("Error loading request body into a dictionary:", e)
        
    url = f"{app.state.UMC_API_BASE_URLS[0]}/{path}"

    headers = {}
    headers["Content-Type"] = "application/json"

    r = None

    try:
        r = requests.request(
            method=request.method,
            url=url,
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
