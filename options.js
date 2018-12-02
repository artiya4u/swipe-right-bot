// Saves options to chrome.storage
function save_options() {
  let apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({
    apiKey: apiKey
  }, function () {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Settings saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 2500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    apiKey: ""
  }, function (items) {
    document.getElementById('apiKey').value = items.apiKey;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
