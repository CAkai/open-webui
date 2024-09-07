# 複製檔案到前端
envsubst '${ICLOUD_API_BASE_URL}' < umc/lib/constants.ts > src/lib/constants_umc.ts
cp umc/routes/+layout.svelte src/routes/+layout.svelte
cp umc/routes/auth-page.svelte src/routes/auth/+page.svelte
mkdir -p src/lib/apis/umc
cp umc/lib/umc-api.ts src/lib/apis/umc/index.ts
cp umc/lib/apis.ts src/lib/apis/index.ts
# 複製檔案到後端
mkdir -p backend/open_webui/umc
cp umc/backend/umc_util.py backend/open_webui/umc/util.py
cp umc/backend/main.py backend/open_webui/main.py
cp umc/backend/openai.py backend/open_webui/apps/openai/main.py
npm run build