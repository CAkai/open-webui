# CHANGELOG

## Trace:
- [ ] 會自動登出可能是因為 JWT 過期時間。

## 2025-12-03:

### Fixed:
- 修正在 0.6.40 會出現「'list' has no attribute 'split'」，必須要在 MCP Server 的 Function Name Filter List 加上**函數名字**才行。[#19492](https://github.com/open-webui/open-webui/pull/19492/files)
  - backend/open_webui/utils/middleware.py
  - backend/open_webui/utils/tools.py
  - src/lib/components/AddToolServerModal.svelte

## 2025-11-27

### Changed:
- `backend/open_webui/routers/models.py:286` 圖片不需要權限認證。
  - 凱哥回覆說速度提昇有感。2025-11-28
- `backend/open_webui/routers/users.py:417` 圖片不需要權限認證。
  - 凱哥回覆說速度提昇有感。2025-11-28

### Fixed:
- 修正 `src/lib/components/notes/Notes/NoteEditor.svelte:297` 因為 `$models` 等於 null，導致 filter 函數呼叫失敗的問題。 