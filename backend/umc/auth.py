import jwt
from datetime import datetime, timedelta
from pytz import UTC
from typing import Optional

from open_webui.env import WEBUI_SECRET_KEY
from open_webui.config import SHARE_TOKEN_EXPIRES_IN
from open_webui.utils.misc import parse_duration

ALGORITHM = "HS256"


def create_share_token(share_id: str, expires_delta: Optional[timedelta] = None) -> str:
    payload = {
        "type": "share",
        "share_id": share_id,
    }

    if expires_delta is None:
        try:
            expires_delta = parse_duration(SHARE_TOKEN_EXPIRES_IN.value)
        except Exception:
            expires_delta = timedelta(days=1)

    if expires_delta is not None:
        expire = datetime.now(UTC) + expires_delta
        payload.update({"exp": expire})

    return jwt.encode(payload, WEBUI_SECRET_KEY, algorithm=ALGORITHM)


def verify_share_token(token: str, share_id: str) -> bool:
    try:
        decoded = jwt.decode(token, WEBUI_SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return False

    if decoded.get("type") != "share":
        return False

    if decoded.get("share_id") != share_id:
        return False

    return True
