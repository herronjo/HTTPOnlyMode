window.onload = function() {
	let allowList = [];
	const pathUrl = new URLSearchParams(window.location.search).get('url');
	const url = new URL(pathUrl);

	// Set the hostname in the block page
	document.getElementById("host").innerText = url.hostname;

	// Close the window when the user clicks the close button
	document.getElementById("close").onclick = function() {
		window.close();
	}
	// Add the domain to the allow list when the user clicks the allow button
	document.getElementById("allow").onclick = function() {
		chrome.storage.local.get('allowList', (data) => {
			if (data.allowList !== undefined) {
				allowList = data.allowList;
			}
			allowList.push(url.hostname);
			chrome.storage.local.set({ allowList: allowList });
		});
		window.location = pathUrl;
	}
}