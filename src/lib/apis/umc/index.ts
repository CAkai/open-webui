import { UMC_API_BASE_URL } from '$lib/constants';
import { promptTemplate } from '$lib/utils';

export const getUMCUrls = async (token: string = '') => {
	let error = null;

	const res = await fetch(`${UMC_API_BASE_URL}/urls`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.UMC_API_BASE_URLS;
};

export const updateUMCUrls = async (token: string = '', urls: string[]) => {
	let error = null;

	const res = await fetch(`${UMC_API_BASE_URL}/urls/update`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		},
		body: JSON.stringify({
			urls: urls
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			if ('detail' in err) {
				error = err.detail;
			} else {
				error = 'Server connection failed';
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res.UMC_API_BASE_URLS;
};

export const getUMCModels = async (token: string = '') => {
	let error = null;

	const res = await fetch(`${UMC_API_BASE_URL}/models`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...(token && { authorization: `Bearer ${token}` })
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			error = `OpenAI: ${err?.error?.message ?? 'Network Problem'}`;
			return [];
		});

	if (error) {
		throw error;
	}

	const models = Array.isArray(res) ? res : res?.data ?? null;

	return models
		? models
				.map((model) => ({ id: model.id, name: model.name ?? model.id, external: true }))
				.sort((a, b) => {
					return a.name.localeCompare(b.name);
				})
		: models;
};

export const getOpenAIModelsDirect = async (
	base_url: string = 'https://api.openai.com/v1',
	api_key: string = ''
) => {
	let error = null;

	const res = await fetch(`${base_url}/models`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${api_key}`
		}
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			return res.json();
		})
		.catch((err) => {
			console.log(err);
			error = `OpenAI: ${err?.error?.message ?? 'Network Problem'}`;
			return null;
		});

	if (error) {
		throw error;
	}

	const models = Array.isArray(res) ? res : res?.data ?? null;

	return models
		.map((model) => ({ id: model.id, name: model.name ?? model.id, external: true }))
		.filter((model) => (base_url.includes('openai') ? model.name.includes('gpt') : true))
		.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
};

export const generateUMCChatCompletion = async (
	token: string = '',
	body: object,
	url: string = UMC_API_BASE_URL
): Promise<[Response | null, AbortController]> => {
	const controller = new AbortController();
	let error = null;

	try {
		console.log("umc image body:", JSON.parse(JSON.stringify(body)));
	} catch(e) {
		console.log("umc image body error", body);
	}

	const res = await fetch(`${url}/api/chat`, {
		signal: controller.signal,
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	.catch((err) => {
		console.log("umc /api/chat error", err);
		error = err;
		return null;
	});

	if (error) {
		throw error;
	}

	return [res, controller];
};

export const generateTitle = async (
	token: string = '',
	template: string,
	model: string,
	prompt: string,
	url: string = UMC_API_BASE_URL
) => {
	let error = null;

	template = promptTemplate(template, prompt);

	console.log(template);

	const res = await fetch(`${url}/api/chat`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			model: model,
			messages: [
				{
					role: 'user',
					content: template
				}
			],
			stream: false
		})
	})
		.then(async (res) => {
			if (!res.ok) throw await res.json();
			// 如果返回的文本有 data: ，需要刪除後再轉成 json
			let s = await res.text();
			console.log("umc title data", s);
			s = s.replace(/data:\s/g, '');
			return JSON.parse(s);
		})
		.catch((err) => {
			console.error("umc /api/chat error", err);
			if ('detail' in err) {
				error = err.detail;
			}
			return null;
		});

	if (error) {
		throw error;
	}

	return res?.choices[0]?.message?.content ?? 'New Chat';
};
