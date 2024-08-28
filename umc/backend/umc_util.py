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