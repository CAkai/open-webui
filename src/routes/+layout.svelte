<script>
	import { onMount, tick, setContext } from 'svelte';
	import { config, user, theme, WEBUI_NAME } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Toaster, toast } from 'svelte-sonner';

	import { getBackendConfig } from '$lib/apis';
	import { getSessionUser, iCloudGetUserInfo } from '$lib/apis/auths';

	import '../tailwind.css';
	import '../app.css';

	import 'tippy.js/dist/tippy.css';

	import { WEBUI_BASE_URL, COOKIE_TOKEN_KEY } from '$lib/constants';
	import i18n, { initI18n } from '$lib/i18n';

	setContext('i18n', i18n);

	let loaded = false;

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
						const userinfo = await iCloudGetUserInfo(localStorage.getItem(COOKIE_TOKEN_KEY) ?? "").catch((error) => {
							toast.error(error);
							return null;
						});

						if (userinfo) {
							sessionUser.role = userinfo.role;
						}

						// Save Session User to Store
						await user.set(sessionUser);
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
