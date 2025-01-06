<!-- 複製到 src/routes/+layout.svelte -->
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
		activeUserIds,
		USAGE_POOL,
		chatId,
		chats,
		currentChatPage,
		tags,
		temporaryChatEnabled
	} from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Toaster, toast } from 'svelte-sonner';

	import { getBackendConfig } from '$lib/apis';
	import { getSessionUser } from '$lib/apis/umc';  // region UMC

	import '../tailwind.css';
	import '../app.css';

	import 'tippy.js/dist/tippy.css';

	import { WEBUI_BASE_URL, WEBUI_HOSTNAME } from '$lib/constants';
	import i18n, { initI18n, getLanguages } from '$lib/i18n';
	import { bestMatchingLanguage } from '$lib/utils';
	import { getAllTags, getChatList } from '$lib/apis/chats';
	import NotificationToast from '$lib/components/NotificationToast.svelte';

	setContext('i18n', i18n);

	//region UMC 自動登入&註冊機制
	let targetURL = '';
	const login = async () => {
		console.log("Current URL", targetURL);
		// Get Session User Info
		const sessionUser = await getSessionUser(localStorage.token).catch((error) => {
			toast.error(error);
			return null;
		});
		console.log('sessionUser:', sessionUser);
		if (sessionUser) {
			// Save Session User to Store
			$socket.emit('user-join', { auth: { token: sessionUser.token } });
			$socket?.on('chat-events', chatEventHandler);
			$socket?.on('channel-events', channelEventHandler);

			// Save Session User to Store
			await user.set(sessionUser);
			await config.set(await getBackendConfig());
			// 這裡不用再 await goto('/')，會讓使用者從 openwebui.com 導入 prompts、tools 等內容。
			// 但是沒有設定的話，從 iCloud 導入的使用者會停在 /auth 頁面
			// 因為 $page.url.pathname 會擷取 http(s)://ip:port 後的路徑，所以直接導向 targetURL 即可
			console.log('Redirecting to', targetURL);
			await goto(targetURL);
		} else {
			// Redirect Invalid Session User to /auth Page
			localStorage.removeItem('token');
			await goto('/auth');
		}
	};

	import { UMC_TOKEN_COOKIE_KEY } from '$lib/constants_umc';
	// 讓系統監控 iframe 傳來的訊息，並自動登入
	// 這個會跑得比較慢，所以裡面必須再登入一遍
	const autoLoginFromICloud = async (event) => {
		const isIgnoredEvent =
			event.source !== window.parent ||
			['handshake', 'detectAngular'].includes(event.data?.topic) ||
			event.data?.source === 'react-devtools-content-script' ||
			event.data?.isAngularDevTools ||
			// 有時候傳進來的 event.data 是 object，這時候就不處理
			typeof event.data !== 'string';

		if (isIgnoredEvent) {
			return;
		}
		// 讓網站記錄 token。這麼做的原因是，iframe 無法直接存取 iCloud 的 cookie。
		localStorage.setItem(UMC_TOKEN_COOKIE_KEY, String(event.data));
		await login();
	};
	//endregion

	let loaded = false;
	const BREAKPOINT = 768;

	const setupSocket = async (enableWebsocket) => {
		const _socket = io(`${WEBUI_BASE_URL}` || undefined, {
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			randomizationFactor: 0.5,
			path: '/ws/socket.io',
			transports: enableWebsocket ? ['websocket'] : ['polling', 'websocket'],
			auth: { token: localStorage.token }
		});

		await socket.set(_socket);

		_socket.on('connect_error', (err) => {
			console.log('connect_error', err);
		});

		_socket.on('connect', () => {
			console.log('connected', _socket.id);
		});

		_socket.on('reconnect_attempt', (attempt) => {
			console.log('reconnect_attempt', attempt);
		});

		_socket.on('reconnect_failed', () => {
			console.log('reconnect_failed');
		});

		_socket.on('disconnect', (reason, details) => {
			console.log(`Socket ${_socket.id} disconnected due to ${reason}`);
			if (details) {
				console.log('Additional details:', details);
			}
		});

		_socket.on('user-list', (data) => {
			console.log('user-list', data);
			activeUserIds.set(data.user_ids);
		});

		_socket.on('usage', (data) => {
			console.log('usage', data);
			USAGE_POOL.set(data['models']);
		});
	};

	const chatEventHandler = async (event) => {
		const chat = $page.url.pathname.includes(`/c/${event.chat_id}`);

		if (
			(event.chat_id !== $chatId && !$temporaryChatEnabled) ||
			document.visibilityState !== 'visible'
		) {
			await tick();
			const type = event?.data?.type ?? null;
			const data = event?.data?.data ?? null;

			if (type === 'chat:completion') {
				const { done, content, title } = data;

				if (done) {
					toast.custom(NotificationToast, {
						componentProps: {
							onClick: () => {
								goto(`/c/${event.chat_id}`);
							},
							content: content,
							title: title
						},
						duration: 15000,
						unstyled: true
					});
				}
			} else if (type === 'chat:title') {
				currentChatPage.set(1);
				await chats.set(await getChatList(localStorage.token, $currentChatPage));
			} else if (type === 'chat:tags') {
				tags.set(await getAllTags(localStorage.token));
			}
		}
	};

	const channelEventHandler = async (event) => {
		// check url path
		const channel = $page.url.pathname.includes(`/channels/${event.channel_id}`);

		if ((!channel || document.visibilityState !== 'visible') && event?.user?.id !== $user?.id) {
			await tick();
			const type = event?.data?.type ?? null;
			const data = event?.data?.data ?? null;

			if (type === 'message') {
				toast.custom(NotificationToast, {
					componentProps: {
						onClick: () => {
							goto(`/channels/${event.channel_id}`);
						},
						content: data?.content,
						title: event?.channel?.name
					},
					duration: 15000,
					unstyled: true
				});
			}
		}
	};

	onMount(async () => {
		theme.set(localStorage.theme);
		targetURL = $page.url.pathname;

		mobile.set(window.innerWidth < BREAKPOINT);
		const onResize = () => {
			if (window.innerWidth < BREAKPOINT) {
				mobile.set(true);
			} else {
				mobile.set(false);
			}
		};

		window.addEventListener('resize', onResize);

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

			if ($config) {
				await setupSocket($config.features?.enable_websocket ?? true);

				if (localStorage.token) {
					// region UMC
					await login();
					// endregion
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

<!-- iCloud 是透過 iframe 跳轉進來，因此網站必須要監控，然後自動登入 -->
<svelte:window on:message={autoLoginFromICloud} />
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

<Toaster
	theme={$theme.includes('dark')
		? 'dark'
		: $theme === 'system'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: 'light'}
	richColors
	position="top-right"
/>