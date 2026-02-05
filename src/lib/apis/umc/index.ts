import { WEBUI_API_BASE_URL } from '$lib/constants';

type SharedChatResponse = {
	chat: unknown;
	user: {
		id: string;
		name: string;
		profile_image_url?: string | null;
	};
};

const fetchSharedChat = async (url: string) => {
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw await response.json();
	}

	return response.json();
};

export const getSharedChat = async (
	shareId: string,
	shareToken: string
): Promise<SharedChatResponse | null> => {
	let error = null;

	const encodedToken = encodeURIComponent(shareToken);
	const primaryUrl = `${WEBUI_API_BASE_URL}/umc/share/${shareId}?token=${encodedToken}`;

	try {
		return await fetchSharedChat(primaryUrl);
	} catch (err) {
		error = err;
		console.error(err);
	}

	if (typeof window !== 'undefined') {
		const fallbackUrl = `${window.location.origin}/api/v1/umc/share/${shareId}?token=${encodedToken}`;
		if (fallbackUrl !== primaryUrl) {
			try {
				return await fetchSharedChat(fallbackUrl);
			} catch (err) {
				error = err;
				console.error(err);
			}
		}
	}

	if (error) {
		throw error;
	}

	return null;
};
