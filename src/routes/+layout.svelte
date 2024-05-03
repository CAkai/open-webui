<script>
	import { onMount, tick, setContext } from 'svelte';
	import { config, user, theme, WEBUI_NAME } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Toaster, toast } from 'svelte-sonner';

	import { getBackendConfig } from '$lib/apis';
	import { getSessionUser, iCloudGetUserInfo, userSignIn, userSignUp } from '$lib/apis/auths';
	import { generateInitialsImage } from '$lib/utils';

	import '../tailwind.css';
	import '../app.css';

	import 'tippy.js/dist/tippy.css';

	import { WEBUI_BASE_URL, COOKIE_TOKEN_KEY } from '$lib/constants';
	import i18n, { initI18n } from '$lib/i18n';

	setContext('i18n', i18n);

	let loaded = false;

	const setSessionUser = async (sessionUser) => {
		if (sessionUser) {
			console.log(sessionUser);
			localStorage.token = sessionUser.token;
			await user.set(sessionUser);
		}
	};

	const signInHandler = async (iCloudUser) => {
		console.log('icloud user', iCloudUser);

		// 透過 iCloud 的使用者資料登入
		// 由於 password 記錄在 token 會有資安風險，而且我們的密碼沒有有效期限，
		// 因此這裡的密碼設定為 iCloud 的 access_token
		const sessionUser = await userSignIn(
			iCloudUser.id + '@umc.com',
			localStorage.getItem(COOKIE_TOKEN_KEY) ?? ''
		).catch((error) => {
			toast.error($i18n.t(error));
			return null;
		});

		if (sessionUser === null) return false;

		// 把 iCloud 的使用者資料合併到 sessionUser
		sessionUser.role = iCloudUser.role;

		await setSessionUser(sessionUser);
		return true;
	};

	const signUpHandler = async (iCloudUser) => {
		const sessionUser = await userSignUp(
			iCloudUser.name,
			iCloudUser.id + '@umc.com',
			localStorage.getItem(COOKIE_TOKEN_KEY) ?? '',
			generateInitialsImage(iCloudUser.name)
		).catch((error) => {
			toast.error($i18n.t(error));
			return null;
		});

		await setSessionUser(sessionUser);
	};

	const handleToken = async (event) => {
		if (
			event.source !== window.parent ||
			['handshake', 'detectAngular'].includes(event.data?.topic) ||
			event.data?.source === 'react-devtools-content-script' ||
			event.data?.isAngularDevTools
		)
			return;

		localStorage.setItem(COOKIE_TOKEN_KEY, event.data);

		const iCloudUser = await iCloudGetUserInfo(localStorage.getItem(COOKIE_TOKEN_KEY) ?? '').catch(
			(error) => {
				toast.error(error);
				return null;
			}
		);

		if (iCloudUser === null) return;

		if (!(await signInHandler(iCloudUser))) {
			await signUpHandler(iCloudUser);
		}

		// 跳轉到首頁
		toast.success($i18n.t('Received iCloud token.') + ' ' + $i18n.t(`You're now logged in.`));
		await goto('/');
	};

	onMount(async () => {
		theme.set(localStorage.theme);
		// Check Backend Status
		const backendConfig = await getBackendConfig();

		if (backendConfig) {
			// Save Backend Status to Store
			await config.set(backendConfig);
			if ($config.default_locale) {
				initI18n($config.default_locale);
			} else {
				initI18n();
			}

			await WEBUI_NAME.set(backendConfig.name);
			console.log(backendConfig);

			if ($config) {
				if (localStorage.token) {
					// Get Session User Info
					const sessionUser = await getSessionUser(localStorage.token).catch((error) => {
						toast.error(error);
						return null;
					});

					if (sessionUser) {
						// 因為 sessionUser.role 在登入後會變成 pending，所以這邊還是去 iCloud 取得使用者資料
						const userinfo = await iCloudGetUserInfo(
							localStorage.getItem(COOKIE_TOKEN_KEY) ?? ''
						).catch((error) => {
							toast.error(error);
							return null;
						});

						if (userinfo) {
							sessionUser.role = userinfo.role;
							// Save Session User to Store
							await user.set(sessionUser);
						} else {
							await goto('/auth');
						}
					} else {
						// Redirect Invalid Session User to /auth Page
						localStorage.removeItem('token');
						await goto('/auth');
					}
				} else {
					await goto('/auth');
				}
			}
		} else {
			// Redirect to /error when Backend Not Detected
			await goto(`/error`);
		}

		await tick();

		document.getElementById('splash-screen')?.remove();
		loaded = true;
	});
</script>

<svelte:window on:message={handleToken} />
<svelte:head>
	<title>{$WEBUI_NAME}</title>
	<link rel="icon" href="{WEBUI_BASE_URL}/static/favicon.png" />

	<!-- rosepine themes have been disabled as it's not up to date with our latest version. -->
	<!-- feel free to make a PR to fix if anyone wants to see it return -->
	<!-- <link rel="stylesheet" type="text/css" href="/themes/rosepine.css" />
	<link rel="stylesheet" type="text/css" href="/themes/rosepine-dawn.css" /> -->
</svelte:head>

{#if loaded}
	<slot />
{/if}

<Toaster richColors position="top-center" />
