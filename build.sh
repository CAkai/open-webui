#! /bin/bash

cp umc/lib/constants.ts src/lib/constants_umc.ts
cp umc/routes/+layout.svelte src/routes/+layout.svelte
mkdir -p src/lib/apis/umc
cp umc/lib/umc-api.ts src/lib/apis/umc/index.ts

npm run build
