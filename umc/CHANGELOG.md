# CHANGELOG

## Trace:
- [ ] 會自動登出可能是因為 JWT 過期時間。

## 2026-05-11: 合併 v0.9.5

### Merged:
- 從 upstream `v0.9.5` (commit `3660bc00fd`) 合併到 `feature/v2`
- 合併範圍：v0.9.2 → v0.9.5（共 197 個檔案變更）

### Conflicts Resolved:
- `src/routes/+layout.svelte`：v0.9.5 重構 socket 事件處理，將 session-targeted RPC 呼叫從 `else if` 移出為獨立區塊。接受 v0.9.5 版本，UMC region 完整保留於 line ~1024。

### UMC Customizations Verified:
- `src/routes/auth/+page.svelte`：`autoSignInHandler()` 與 `randomPasswordSalt` 完整保留
- `src/routes/+layout.svelte`：empNo/empName SSO redirect 邏輯完整保留
- `backend/open_webui/main.py`：兩個 `// region UMC` 區塊完整保留
- `backend/open_webui/routers/models.py`：自動合併成功
- `backend/open_webui/routers/users.py`：自動合併成功
- `src/lib/apis/index.ts`：自動合併成功
- `src/lib/apis/images/index.ts`：自動合併成功
- `src/lib/components/chat/ShareChatModal.svelte`：自動合併成功
- `src/lib/components/common/Image.svelte`：自動合併成功
- `src/lib/components/notes/NoteEditor.svelte`：自動合併成功

### Backup:
- `umc/backup/20260511/`

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