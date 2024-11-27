# 複製到 open_webui/umc/util.py
def refactor_messages(messages:list[dict]) -> list[dict]:
    '''
    重新整理 messages 的格式，如果其中一個 message.content 是 list，就轉成 content:[{"type":xx, "text": "xxx"}] 的格式。
    
    Arvin Yang - 2024/08/20
    '''
    if any(isinstance(message["content"], list) for message in messages):
        for message in messages:
            if isinstance(message["content"], str):
                message["content"] = [{"type": "text", "text": message["content"]}]

    return messages

def simplify_messages(messages:list[dict]) -> list[dict]:
    """
    簡化 messages 的格式，將 content:[{"type":xx, "text": "xxx"}] 的格式轉成 content: "xxx" 的格式。
    如果有 type 不是 text 的，就直接省略。
    """
    filter_is_text = lambda c: c["type"] == "text"  # noqa: E731
    return [
        {
            "role": m["role"],
            "content": m["content"] if isinstance(m["content"], str) else "".join([e["text"] for e in filter(filter_is_text, m["content"])])
        }
        for m in messages
    ]