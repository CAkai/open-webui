# 更新日誌

## 0.3.8 - 2024-07-12
- migration 讀取 alembic.ini，但是使用 logger_alembic 會阻塞，導致 uvicorn 無法繼續，因此這裡先暫停使用。
- 生產環境打開 RAG_EMBEDDING_AUTO_UPDATE 和 RAG_RERANKING_AUTO_UPDATE 的設定，讓它可以自動下載 RAG Model。
- 修正 Ollama 在生成對話時，無法將 OpenAIChatCompletionForm 轉成 dict 的問題。
- Nvidia V100 因為 [CUDA Error for V100] 而無法使用 ollama，已經在 [ollama#5588] 解決，但是還沒上版。

[CUDA Error for V100]: https://github.com/ollama/ollama/issues/5571
[ollama#5588]: https://github.com/ollama/ollama/pull/5588

## 0.3.4 - 2024-06-17
合併 0.3.4 版本。

## Unreleased - 2024-05-20
### Added:
- 可上傳圖片與中繼機溝通。([9dd0894])
- 透過內建的 RAG 功能把上傳文件餵給中繼機。([da8213f])

### Fixed:
- 修正有時候會跳出「無效的Token」的問題。([e5cde24])
  - 透過強制轉型為 String 再儲存來解決這個問題。([147c4b1])
- 修正生產環境無法解析 Stream Data「syntax: "data: {'id': ...}" is invalid format 'd' json」的問題。([325bc7a])
- 修正 sendPromptUMC 在接收回傳時，沒有記錄 citations，導致 response message 不會顯示相關文件的問題。([1e2f823])
- 調整 UMC GPT 為 stream 模式，解決本地模型和 UMC GPT 同時使用時，會因為要等待 UMC GPT 的回傳導致 Ollama 卡住。([6c766fd])


[6c766fd]: https://github.com/CAkai/open-webui/commit/6c766fd783fe006fd63f9f1743d56db94c6df747
[1e2f823]: https://github.com/CAkai/open-webui/commit/1e2f823eb3571132fda6284bcbf255c89502b822
[147c4b1]: https://github.com/CAkai/open-webui/commit/147c4b1fe838d3ff7c1294680ca654a00836ac09
[da8213f]: https://github.com/CAkai/open-webui/commit/da8213f2f40599e4d2298f83a3de2dadf5dfc725
[e5cde24]: https://github.com/CAkai/open-webui/commit/e5cde247144572354ba30c42cb76fbda024b85a7
[325bc7a]: https://github.com/CAkai/open-webui/commit/325bc7a56d4750d0b3dcc431912b99dfb78433cf
[9dd0894]: https://github.com/CAkai/open-webui/commit/9dd08946e2e7a4811cbdf024b2cda3c544dd6d8f

## [0.2.0] - 2024-05-08
### Added:
- 加入中繼機。

### Changed:
- 更換 logo。
- 登入者名稱從工號改為員工名字。

## [0.1.0] - 2024-04-29 - First Commit
- 成功建置於本地端。