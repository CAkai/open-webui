# CHANGELOG

## 2025-11-27

### Trace:
- [ ] 會自動登出可能是因為 JWT 過期時間。

### Changed:
- `backend/open_webui/routers/models.py:286` 圖片不需要權限認證。
- `backend/open_webui/routers/users.py:417` 圖片不需要權限認證。

### Fixed:
- 修正 `src/lib/components/notes/Notes/NoteEditor.svelte:297` 因為 `$models` 等於 null，導致 filter 函數呼叫失敗的問題。 