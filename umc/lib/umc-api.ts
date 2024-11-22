// 這個檔案會被寫入 src/lib/apis/umc/index.ts
import { UMC_TOKEN_COOKIE_KEY, ICLOUD_API_BASE_URL } from "$lib/constants_umc";
import { generateInitialsImage } from "$lib/utils";
import { getSessionUser as getUser, userSignUp as signup, userSignIn as login } from "../auths";

type UserInfo = {
    id: string;
    name: string;
    department: string;
    email: string;
    role: string;
};

type User = {
    id: string;
    name: string;
    department: string;
    access_token: string;
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
// 抓到 iCloud 使用者資訊後，再用 token 抓本地使用者。這裡還要檢查兩者的 id 是否一樣。
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

    // 核對是否有抓到本地使用者以及必須和 iCloud 使用者的 id 一樣
    // 因為 localStorage.token 有可能是系統記錄的 token，不一定是 iCloud 使用者的 token
    if (user && user.email === iCloudUser.id + "@umc.com") {
        // 把 iCloud 使用者角色覆寫到本地使用者
        console.log('user found', user);
        user.role = iCloudUser.role;
        console.log(`user role updated from ${user.role} to ${iCloudUser.role}`);
        return user;
    }

    console.log('user not found, sign in or sign up');

    // 先登入，判斷是否有這個使用者
    const email = iCloudUser.id + '@umc.com';
    let newUser = await login(email, umcToken).catch((error) => null);

    // 如果沒有這個使用者，就註冊一個新的使用者
    if (newUser === null) {
        console.log('user not found, sign up');
        newUser = await signup(
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

// userSignIn 和 userSignUp 這兩個函式的流程是一樣的，只是 userSignIn 會先登入，沒有才註冊，而 userSignUp 是直接註冊。
export async function userSignIn(empid: string, password: string) {
    // 先登入 iCloud，拿到 token
    const iCloudUser = await iCloudSignIn(empid, password);

    if (!iCloudUser) {
        throw new Error("login failed");
    }
    // 把 token 存到 localStorage
    localStorage.setItem(UMC_TOKEN_COOKIE_KEY, iCloudUser.access_token);
    // 取得使用者資訊
    const userinfo = await getICloudUserInfo(iCloudUser.access_token);
    // 用 token 登入本地
    const email = iCloudUser.id + '@umc.com';
	let newUser = await login(email, iCloudUser.access_token).
        then(user => {
            // 更新使用者角色
            if (userinfo) user.role = userinfo.role;
            else user.role = 'user';
            console.log('userSignIn user', user);
            return user;
        }).catch((error) => null);

    // 如果沒有這個使用者，就註冊一個新的使用者
    if (newUser === null) {
        console.log('user not found, sign up');
        newUser = await signup(
            iCloudUser.name,
            email,
            iCloudUser.access_token,
            generateInitialsImage(iCloudUser.name)
        ).catch((error) => null);
    }

    // 更新使用者角色、token
    if (newUser) {
        newUser.role = userinfo?.role ?? "user";
        localStorage.token = newUser.token;
        return newUser;
    }

    throw new Error("login failed");
};

async function iCloudSignIn(empid: string, password: string): Promise<User | null> {
    let error = null;

	// 設定 FormData
	const body = new FormData();
	body.append('username', empid);
	body.append('password', password);

	// 原本以為客戶端也要設定 CORS，但是後來發現只要 iCloud 補上就行了。 Arvin Yang - 2024/04/30
	const res = await fetch(`${ICLOUD_API_BASE_URL}/api/v1/login`, {
		method: 'POST',
		body: body
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err: {message: string; error: string}) => {
			console.log(err);

			error = "EmpId or password is incorrect.";
			return null;
		});

	if (error) {
		throw error;
	}

	return res;
}

export async function userSignUp(
	name: string,
	empid: string,
	password: string,
	profile_image_url: string
) {
    // 先登入 iCloud，拿到 token
    const iCloudUser = await iCloudSignIn(empid, password);

    if (!iCloudUser) {
        throw new Error("signup failed");
    }
    // 把 token 存到 localStorage
    localStorage.setItem(UMC_TOKEN_COOKIE_KEY, iCloudUser.access_token);
    // 取得使用者資訊
    const userinfo = await getICloudUserInfo(iCloudUser.access_token);
    return await signup(iCloudUser.name, iCloudUser.id + "@umc.com", iCloudUser.access_token, profile_image_url)
    .then(user => {
        // 更新使用者角色
        if (userinfo) user.role = userinfo.role;
        else user.role = 'user';
        return user;
    });
};