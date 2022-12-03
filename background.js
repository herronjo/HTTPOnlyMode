const inProcess = new Set();
let enabled = true;
let allowList = [];
let allowWss = false;

// Reload settings from storage
function reloadAllowList() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('enabled', (data) => {
			if (data.enabled !== undefined) {
				enabled = data.enabled;
			}
			chrome.storage.local.get('allowList', (data) => {
				if (data.allowList !== undefined) {
					allowList = data.allowList;
				}
				chrome.storage.local.get('allowWss', (data) => {
					if (data.allowWss !== undefined) {
						allowWss = data.allowWss;
					}
					resolve();
				});
			});
		});
	});
}

// Downgrade HTTPS request to HTTP if domain is not in allowList
// Block wss request if domain is not in allowList or if wss is not allowed
chrome.webRequest.onBeforeRequest.addListener(async (details) => {
	await reloadAllowList();
	console.log("onBeforeRequest", details);
	if (!enabled) return;
	if (inProcess.has(details.requestId)) return;
	const url = new URL(details.url);
	if (!allowList.includes(url.hostname) && details.url.startsWith('https://')) {
		url.protocol = 'http:';
		inProcess.add(details.requestId);
		return { redirectUrl: url.toString() };
	}
	if (details.url.startsWith('wss://') && !allowList.includes(url.hostname) && !allowWss) {
		return { cancel: true };
	}
}, {
	urls: ["<all_urls>"]
}, [
	"blocking"
]);

// Strip Upgrade-Insecure-Requests header from requests if the domain is not in the allowList
chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
	console.log("onBeforeSendHeaders", details);
	if (!enabled) return;
	const url = new URL(details.url);
	if (!allowList.includes(url.hostname)) {
		return { requestHeaders: details.requestHeaders.filter((header) => header.name.toLowerCase() !== 'upgrade-insecure-requests') };
	}
}, {
	urls: ["<all_urls>"]
}, [
	"blocking",
	"requestHeaders"
]);

// Detect if site wants to upgrade to HTTPS and redirect to block page if not in allow list
chrome.webRequest.onHeadersReceived.addListener((details) => {
	console.log("onHeadersReceived", details);
	if (!enabled) return;
	if (inProcess.has(details.requestId)) inProcess.delete(details.requestId);
	// Check if site wants to upgrade to HTTPS
	const tryingToUpgrade = details.responseHeaders.find((header) => header.name.toLowerCase() === 'location' && header.value.startsWith('https://'));
	
	if (!(details.url.startsWith('https://') || tryingToUpgrade)) return;

	// Check if site is in allow list
	const url = new URL(details.url);
	if (allowList.includes(url.hostname)) return;

	// Block types that are not an HTML document
	switch (details.type) {
		case 'main_frame':
		case 'sub_frame':
			// Continue
			break;
		case 'image':
			// Display image with warning
			return { redirectUrl: chrome.runtime.getURL('img/blocked.png') };
		default:
			// Cancel request
			return { cancel: true };
	}

	// Redirect to block page
	chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL(`block.html?url=${encodeURIComponent(details.url)}`) });
}, {
	urls: ["<all_urls>"]
}, [
	"blocking",
	"responseHeaders"
]);