<script>
	import { io } from 'socket.io-client';
	import { spring } from 'svelte/motion';

	let loadingProgress = spring(0, {
		stiffness: 0.05
	});

	import { onMount, tick, setContext } from 'svelte';
	import {
		config,
		user,
		theme,
		WEBUI_NAME,
		mobile,
		socket,
		activeUserCount,
		USAGE_POOL
	} from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Toaster, toast } from 'svelte-sonner';

	import { getBackendConfig } from '$lib/apis';
	import { getSessionUser, iCloudGetUserInfo, userSignIn, userSignUp } from '$lib/apis/auths';
	import { generateInitialsImage } from '$lib/utils';

	import '../tailwind.css';
	import '../app.css';

	import 'tippy.js/dist/tippy.css';

	import { WEBUI_BASE_URL, COOKIE_TOKEN_KEY, WEBUI_HOSTNAME } from '$lib/constants';
	import i18n, { initI18n, getLanguages } from '$lib/i18n';
	import { bestMatchingLanguage } from '$lib/utils';

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

		console.log('Receiving iCloud token.', event.data, typeof event.data === "string");
		if (typeof event.data !== "string") {
			return;
		}

		localStorage.setItem(COOKIE_TOKEN_KEY, String(event.data));

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
	const BREAKPOINT = 768;

	let wakeLock = null;

	onMount(async () => {
		theme.set(localStorage.theme);

		mobile.set(window.innerWidth < BREAKPOINT);
		const onResize = () => {
			if (window.innerWidth < BREAKPOINT) {
				mobile.set(true);
			} else {
				mobile.set(false);
			}
		};

		window.addEventListener('resize', onResize);

		const setWakeLock = async () => {
			try {
				wakeLock = await navigator.wakeLock.request('screen');
			} catch (err) {
				// The Wake Lock request has failed - usually system related, such as battery.
				console.log(err);
			}

			if (wakeLock) {
				// Add a listener to release the wake lock when the page is unloaded
				wakeLock.addEventListener('release', () => {
					// the wake lock has been released
					console.log('Wake Lock released');
				});
			}
		};

		if ('wakeLock' in navigator) {
			await setWakeLock();

			document.addEventListener('visibilitychange', async () => {
				// Re-request the wake lock if the document becomes visible
				if (wakeLock !== null && document.visibilityState === 'visible') {
					await setWakeLock();
				}
			});
		}

		let backendConfig = null;
		try {
			backendConfig = await getBackendConfig();
			console.log('Backend config:', backendConfig);
		} catch (error) {
			console.error('Error loading backend config:', error);
		}
		// Initialize i18n even if we didn't get a backend config,
		// so `/error` can show something that's not `undefined`.

		initI18n();
		if (!localStorage.locale) {
			const languages = await getLanguages();
			const browserLanguages = navigator.languages
				? navigator.languages
				: [navigator.language || navigator.userLanguage];
			const lang = backendConfig.default_locale
				? backendConfig.default_locale
				: bestMatchingLanguage(languages, browserLanguages, 'en-US');
			$i18n.changeLanguage(lang);
		}

		if (backendConfig) {
			// Save Backend Status to Store
			await config.set(backendConfig);
			await WEBUI_NAME.set(backendConfig.name);
			console.log(backendConfig);
			console.log("token", localStorage.token, localStorage.getItem(COOKIE_TOKEN_KEY) ?? '');

			if ($config) {
				const _socket = io(`${WEBUI_BASE_URL}`, {
					path: '/ws/socket.io',
					auth: { token: localStorage.token }
				});

				_socket.on('connect', () => {
					console.log('connected');
				});

				await socket.set(_socket);

				_socket.on('user-count', (data) => {
					console.log('user-count', data);
					activeUserCount.set(data.count);
				});

				_socket.on('usage', (data) => {
					console.log('usage', data);
					USAGE_POOL.set(data['models']);
				});

				if (localStorage.token) {
					// Get Session User Info
					const sessionUser = await getSessionUser(localStorage.token).catch((error) => {
						toast.error(error);
						return null;
					});

					if (sessionUser) {
						// 因為 sessionUser.role 在登入後會變成 pending，所以這邊還是去 iCloud 取得使用者資料
						//? 這裡常常取失敗，因為 COOKIE_TOKEN_KEY會變成 [object.object]
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
						localStorage.removeItem(COOKIE_TOKEN_KEY);
						await goto('/auth');
					}
				} else {
					// Don't redirect if we're already on the auth page
					// Needed because we pass in tokens from OAuth logins via URL fragments
					if ($page.url.pathname !== '/auth') {
						await goto('/auth');
					}
				}
			}
		} else {
			// Redirect to /error when Backend Not Detected
			await goto(`/error`);
		}

		await tick();

		if (
			document.documentElement.classList.contains('her') &&
			document.getElementById('progress-bar')
		) {
			loadingProgress.subscribe((value) => {
				const progressBar = document.getElementById('progress-bar');

				if (progressBar) {
					progressBar.style.width = `${value}%`;
				}
			});

			await loadingProgress.set(100);

			document.getElementById('splash-screen')?.remove();

			const audio = new Audio(`/audio/greeting.mp3`);
			const playAudio = () => {
				audio.play();
				document.removeEventListener('click', playAudio);
			};

			document.addEventListener('click', playAudio);

			loaded = true;
		} else {
			document.getElementById('splash-screen')?.remove();
			loaded = true;
		}

		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<svelte:window on:message={handleToken} />
<svelte:head>
	<title>{$WEBUI_NAME}</title>
	<link crossorigin="anonymous" rel="icon" href="{WEBUI_BASE_URL}/static/favicon.png" />

	<!-- rosepine themes have been disabled as it's not up to date with our latest version. -->
	<!-- feel free to make a PR to fix if anyone wants to see it return -->
	<!-- <link rel="stylesheet" type="text/css" href="/themes/rosepine.css" />
	<link rel="stylesheet" type="text/css" href="/themes/rosepine-dawn.css" /> -->
</svelte:head>

{#if loaded}
	<slot />
{/if}

<Toaster richColors position="top-center" />
