from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from open_webui.constants import ERROR_MESSAGES
from open_webui.internal.db import get_session

from umc.auth import verify_share_token
from umc.service import get_shared_chat, get_shared_chat_user

router = APIRouter()


class SharedChatUser(BaseModel):
    id: str
    name: str
    profile_image_url: Optional[str] = None


class SharedChatResponse(BaseModel):
    chat: dict
    user: SharedChatUser


@router.get("/share/{share_id}", response_model=SharedChatResponse)
async def get_shared_chat_by_id(
    share_id: str,
    token: str,
    db: Session = Depends(get_session),
):
    if not verify_share_token(token, share_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )

    chat = get_shared_chat(share_id, db=db)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )

    user = get_shared_chat_user(chat.user_id, db=db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.USER_NOT_FOUND,
        )

    return {
        "chat": chat.model_dump(),
        "user": {
            "id": user.id,
            "name": user.name,
            "profile_image_url": user.profile_image_url,
        },
    }
