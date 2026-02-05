from typing import Optional
from sqlalchemy.orm import Session

from open_webui.models.chats import Chats
from open_webui.models.users import Users


def get_shared_chat(share_id: str, db: Session):
    return Chats.get_chat_by_share_id(share_id, db=db)


def get_shared_chat_user(user_id: str, db: Session):
    if user_id.startswith("shared-"):
        original_chat_id = user_id.replace("shared-", "", 1)
        chat = Chats.get_chat_by_id(original_chat_id, db=db)
        if chat:
            user_id = chat.user_id

    return Users.get_user_by_id(user_id, db=db)
