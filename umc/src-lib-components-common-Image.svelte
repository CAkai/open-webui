<script lang="ts">
	import { onMount } from 'svelte';
	import { WEBUI_BASE_URL } from '$lib/constants';
	import ImagePreview from './ImagePreview.svelte';

	export let src = '';
	export let alt = '';

	export let className = ' w-full outline-hidden focus:outline-hidden';
	export let imageClassName = 'rounded-lg';
	// region UMC 修正圖片因為抓不到 token 而無法顯示的問題
	const fetchImage = async () => {
		if (!localStorage.token || !src.startsWith('/')) {
			return src;
		}
		console.log('re-fetching image', src);
		const response = await fetch(`${WEBUI_BASE_URL}${src}`, {
			headers: {
				Authorization: `Bearer ${localStorage.token}`,
			},
		});
		const blob = await response.blob();
		return URL.createObjectURL(blob);
	};

	let _src = '';
	$: _src = src.startsWith('/') ? `${WEBUI_BASE_URL}${src}` : src;

	onMount(async () => {
		_src = await fetchImage();
	});

	let showImagePreview = false;
</script>

<button
	class={className}
	on:click={() => {
		showImagePreview = true;
	}}
	type="button"
>
	<img src={_src} {alt} class={imageClassName} draggable="false" data-cy="image" />
</button>

<ImagePreview bind:show={showImagePreview} src={_src} {alt} />