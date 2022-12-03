window.onload = function() {
	// Set the value of the checkboxes to the values stored in chrome.storage
	chrome.storage.local.get('allowWss', (data) => {
		if (data.allowWss !== undefined) {
			document.getElementById('allowWss').checked = data.allowWss;
		} else {
			document.getElementById('allowWss').checked = false;
		}
	});
	chrome.storage.local.get('enabled', (data) => {
		if (data.enabled !== undefined) {
			document.getElementById('enabled').checked = data.enabled;
		} else {
			document.getElementById('enabled').checked = true;
		}
	});

	// Fill in allowed list with delete buttons
	chrome.storage.local.get('allowList', (data) => {
		if (data.allowList !== undefined) {
			for (let i = 0; i < data.allowList.length; i++) {
				const li = document.createElement('li');
				li.appendChild(document.createTextNode(data.allowList[i]));
				const button = document.createElement('button');
				button.appendChild(document.createTextNode('Delete'));
				button.onclick = function() {
					const allowList = data.allowList;
					allowList.splice(i, 1);
					chrome.storage.local.set({ allowList: allowList });
					li.remove();
				}
				li.appendChild(button);
				document.getElementById('allowList').appendChild(li);
			}
		}
	});

	// Set enabled when checkbox is clicked
	document.getElementById("enabled").onclick = function() {
		chrome.storage.local.set({ enabled: document.getElementById("enabled").checked });
	}

	// Set allowWss when checkbox is clicked
	document.getElementById("allowWss").onclick = function() {
		chrome.storage.local.set({ allowWss: document.getElementById("allowWss").checked });
	}
}