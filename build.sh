# 複製檔案到前端
cp umc/routes/+layout.svelte src/routes/+layout.svelte
cp umc/routes/auth-page.svelte src/routes/auth/+page.svelte
mkdir -p src/lib/apis/umc
cp umc/lib/umc-api.ts src/lib/apis/umc/index.ts
cp umc/lib/apis.ts src/lib/apis/index.ts
# 複製檔案到後端
mkdir -p backend/umc
cp umc/backend/umc_util.py backend/umc/util.py
cp umc/backend/main.py backend/main.py
cp umc/backend/openai.py backend/apps/openai/main.py
npm run build