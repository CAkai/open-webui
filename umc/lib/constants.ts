// 這個檔案會先被 envsubst 覆寫，然後再寫入 src/lib/constants_umc.ts
export const ICLOUD_API_BASE_URL = "${ICLOUD_API_BASE_URL}";
export const UMC_TOKEN_COOKIE_KEY = "umc-camera-access_token";