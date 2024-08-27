// 這個檔案會被寫入 src/lib/apis/umc/index.ts
import { UMC_TOKEN_COOKIE_KEY, ICLOUD_API_BASE_URL } from "$lib/constants_umc";
import { generateInitialsImage } from "$lib/utils";
import { getSessionUser as getUser, userSignUp, userSignIn } from "../auths";

type UserInfo = {
    id: string;
    name: string;
    department: string;
    email: string;
    role: string;
};

async function getICloudUserInfo(token: string): Promise<UserInfo | null> {
	// 原本以為客戶端也要設定 CORS，但是後來發現只要 iCloud 補上就行了。 Arvin Yang - 2024/04/30
	return await fetch(`${ICLOUD_API_BASE_URL}/api/v1/auth`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json() as Promise<UserInfo>;
		})
		.catch((err: {message: string; error: string}) => {
			console.log(`${ICLOUD_API_BASE_URL}/api/v1/auth error`, err);
			return null;
		});
};
// 先檢驗有沒有 umc_token，沒有的話直接回傳 null，不用考慮到底有沒有 token。
// 抓到 iCloud 使用者資訊後，再用 token 抓本地使用者。
// 有抓到就把 iCloud 使用者角色覆寫到本地使用者，然後回傳。
// 沒抓到就自動註冊一個新的本地使用者，然後回傳。
export async function getSessionUser(token: string) {
    const umcToken = localStorage.getItem(UMC_TOKEN_COOKIE_KEY) ?? '';

    if (!umcToken) {
        console.log('umc token not found');
        return null;
    }

    // 先抓取 iCloud 使用者資訊
    // 如果不是 iCloud 使用者，也回傳 null
    const iCloudUser = await getICloudUserInfo(umcToken);
    
    if (!iCloudUser) {
        console.log('iCloud user not found');
        return null;
    }

    console.log('iCloud user found', iCloudUser);

    // 先檢查這個 token 是不是 Open Web UI 的 token
	const user = await getUser(token).catch((error) => null);

    if (user) {
        // 如果有抓到本地使用者，就把 iCloud 使用者角色覆寫到本地使用者
        user.role = iCloudUser.role;
        console.log('user found', user);
        return user;
    }

    console.log('user not found, sign in or sign up');

    // 先登入，判斷是否有這個使用者
    const email = iCloudUser.id + '@umc.com';
    let newUser = await userSignIn(email, umcToken).catch((error) => null);

    // 如果沒有這個使用者，就註冊一個新的使用者
    if (newUser === null) {
        console.log('user not found, sign up');
        newUser = await userSignUp(
            iCloudUser.name,
            email,
            umcToken,
            generateInitialsImage(iCloudUser.name)
        ).catch((error) => null);
    }

    // 更新使用者角色、token
    if (newUser) {
        newUser.role = iCloudUser.role;
        localStorage.token = newUser.token;
        return newUser;
    }

    throw new Error("login failed");
}