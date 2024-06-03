<script>
	import { goto } from '$app/navigation';
	import { userSignIn, userSignUp, iCloudSignIn } from '$lib/apis/auths';
	import Spinner from '$lib/components/common/Spinner.svelte';
	import { COOKIE_TOKEN_KEY } from '$lib/constants';
	import { WEBUI_NAME, config, user } from '$lib/stores';
	import { onMount, getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { generateInitialsImage, canvasPixelTest } from '$lib/utils';

	const i18n = getContext('i18n');

	let loaded = false;
	let mode = 'signin';

	let name = '';
	let empid = '';
	let password = '';

	const setSessionUser = async (sessionUser) => {
		if (sessionUser) {
			console.log(sessionUser);
			toast.success($i18n.t(`You're now logged in.`));
			localStorage.token = sessionUser.token;
			await user.set(sessionUser);
			goto('/');
		}
	};

	const signInHandler = async (iCloudUser) => {
		console.log("icloud user", iCloudUser);
		
		// 透過 iCloud 的使用者資料登入
		// 由於 password 記錄在 token 會有資安風險，而且我們的密碼沒有有效期限，
		// 因此這裡的密碼設定為 iCloud 的 access_token
		const sessionUser = await userSignIn(empid+"@umc.com", localStorage.getItem(COOKIE_TOKEN_KEY) ?? '').catch((error) => {
			// 這個不用顯示，因為會和 iCloud 的登入訊息打架
			// toast.error($i18n.t(error));
			return null;
		});
		
		if (sessionUser === null) return false;

		// 把 iCloud 的使用者資料合併到 sessionUser
		sessionUser.role = iCloudUser.role;

		await setSessionUser(sessionUser);
		return true;
	};

	const signUpHandler = async (iCloudUser) => {
		const sessionUser = await userSignUp(iCloudUser.name, iCloudUser.id+"@umc.com", localStorage.getItem(COOKIE_TOKEN_KEY) ?? '', generateInitialsImage(iCloudUser.name)).catch(
			(error) => {
				toast.error(error);
				return null;
			}
		);

		if (sessionUser === null) return;

		// 把 iCloud 的使用者資料合併到 sessionUser
		sessionUser.role = iCloudUser.role;

		await setSessionUser(sessionUser);
	};

	const submitHandler = async () => {
		// 讀取 iCloud 的使用者資料，讓使用者可以直接使用 iCloud 帳號登入
		const iCloudUser = await iCloudSignIn(empid, password).catch((error) => {
			toast.error($i18n.t(error));
			return null;
		});

		if (iCloudUser === null) return;

		// 儲存 iCloud token
		console.log(iCloudUser.access_token, typeof iCloudUser.access_token === 'string')
		localStorage.setItem(COOKIE_TOKEN_KEY, String(iCloudUser.access_token));

		if (!await signInHandler(iCloudUser)) {
			await signUpHandler(iCloudUser);
		}
	};

	
	onMount(async () => {

		if ($user !== undefined) {
			await goto('/');
		}
		loaded = true;
		
		// if ($config?.trusted_header_auth ?? false) {
		// 	await signInHandler();
		// }
	});
</script>

<svelte:head>
	<title>
		{`${$WEBUI_NAME}`}
	</title>
</svelte:head>

{#if loaded}
	<!-- <div class="fixed m-10 z-50">
		<div class="flex space-x-2">
			<div class=" self-center">
				<img
					crossorigin="anonymous"
					src="{WEBUI_BASE_URL}/static/favicon.png"
					class=" w-8 rounded-full"
					alt="logo"
				/>
			</div>
		</div>
	</div> -->

	<div class=" bg-white dark:bg-gray-950 min-h-screen w-full flex justify-center font-mona">
		<!-- <div class="hidden lg:flex lg:flex-1 px-10 md:px-16 w-full bg-yellow-50 justify-center">
			<div class=" my-auto pb-16 text-left">
				<div>
					<div class=" font-bold text-yellow-600 text-4xl">
						Get up and running with <br />large language models, locally.
					</div>

					<div class="mt-2 text-yellow-600 text-xl">
						Run Llama 2, Code Llama, and other models. Customize and create your own.
					</div>
				</div>
			</div>
		</div> -->

		<div class="w-full sm:max-w-md px-10 min-h-screen flex flex-col text-center">
			{#if ($config?.features.auth_trusted_header ?? false) || $config?.features.auth === false}
				<div class=" my-auto pb-10 w-full">
					<div
						class="flex items-center justify-center gap-3 text-xl sm:text-2xl text-center font-bold dark:text-gray-200"
					>
						<div>
							{$i18n.t('Signing in')}
							{$i18n.t('to')}
							{$WEBUI_NAME}
						</div>

						<div>
							<Spinner />
						</div>
					</div>
				</div>
			{:else}
				<div class="  my-auto pb-10 w-full dark:text-gray-100">
					<form
						class=" flex flex-col justify-center"
						on:submit|preventDefault={() => {
							submitHandler();
						}}
					>
						<div class="mb-1">
							<div class=" text-2xl font-bold">
								{mode === 'signin' ? $i18n.t('Sign in') : $i18n.t('Sign up')}
								{$i18n.t('to')}
								{$WEBUI_NAME}
							</div>

							{#if mode === 'signup'}
								<div class=" mt-1 text-xs font-medium text-gray-500">
									ⓘ {$WEBUI_NAME}
									{$i18n.t(
										'does not make any external connections, and your data stays securely on your locally hosted server.'
									)}
								</div>
							{/if}
						</div>

						<div class="flex flex-col mt-4">
							{#if mode === 'signup'}
								<div>
									<div class=" text-sm font-semibold text-left mb-1">{$i18n.t('Name')}</div>
									<input
										bind:value={name}
										type="text"
										class=" px-5 py-3 rounded-2xl w-full text-sm outline-none border dark:border-none dark:bg-gray-900"
										autocomplete="name"
										placeholder={$i18n.t('Enter Your Full Name')}
										required
									/>
								</div>

								<hr class=" my-3 dark:border-gray-900" />
							{/if}

							<div class="mb-2">
								<div class=" text-sm font-semibold text-left mb-1">{$i18n.t('EmpId')}</div>
								<input
									bind:value={empid}
									type="text"
									class=" border px-4 py-2.5 rounded-2xl w-full text-sm outline-none border dark:border-none dark:bg-gray-900"
									autocomplete="empid"
									placeholder={$i18n.t('Enter Your EmpId')}
									required
								/>
							</div>

							<div>
								<div class=" text-sm font-semibold text-left mb-1">{$i18n.t('Password')}</div>

								<input
									bind:value={password}
									type="password"
									class=" px-5 py-3 rounded-2xl w-full text-sm outline-none border dark:border-none dark:bg-gray-900"
									placeholder={$i18n.t('Enter Your Password')}
									autocomplete="current-password"
									required
								/>
							</div>
						</div>

						<div class="mt-5">
							<button
								class=" bg-gray-900 hover:bg-gray-800 w-full rounded-2xl text-white font-semibold text-sm py-3 transition"
								type="submit"
							>
								{mode === 'signin' ? $i18n.t('Sign in') : $i18n.t('Create Account')}
							</button>

							<!-- <div class=" mt-4 text-sm text-center">
								{mode === 'signin'
									? $i18n.t("Don't have an account?")
									: $i18n.t('Already have an account?')}

								<button
									class=" font-medium underline"
									type="button"
									on:click={() => {
										if (mode === 'signin') {
											mode = 'signup';
										} else {
											mode = 'signin';
										}
									}}
								>
									{mode === 'signin' ? $i18n.t('Sign up') : $i18n.t('Sign in')}
								</button>
							</div> -->
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.font-mona {
		font-family: 'Mona Sans', -apple-system, 'Arimo', ui-sans-serif, system-ui, 'Segoe UI', Roboto,
			Ubuntu, Cantarell, 'Noto Sans', sans-serif, 'Helvetica Neue', Arial, 'Apple Color Emoji',
			'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
	}
</style>
