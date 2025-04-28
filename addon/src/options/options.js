'use strict';

const el = {
  optionsForm: document.getElementById('options-form'), 
};

browser.storage.local.get({
  comfyDomains: [
    'http://localhost:8188/*',
    'http://127.0.0.1:8188/*'
  ]
}).then(populateSettings);

// Bind event handlers to the form.

function populateSettings (results) {
  // Restore the options from local stoage.
  
}

// Save the options to local storage.
async function saveOptions (event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!el.optionsForm.checkValidity()) {
    return;
  }

  let comfyDomains = [];

  // Save all settings.
  await browser.storage.local.set({
    comfyDomains
  });

  alert('Settings have been saved');
}

// Backup settings to a JSON file which is downloaded.
async function backupSettings () {
  // Get the settings to be backed up.
  let backupSettings = await browser.storage.local.get({
    comfyDomains: []
  });

  // Wrap the settings in an envelope.
  let backupData = {};
  backupData.settings = backupSettings;
  backupData.timestamp = new Date();
  backupData.fileName = 'comfyuiLiebsPicker.' + [
    String(backupData.timestamp.getFullYear()),
    String(backupData.timestamp.getMonth() + 1).padStart(2, '0'),
    String(backupData.timestamp.getDate()).padStart(2, '0')
  ].join('-') + '.json';
  // Record the current addon version.
  let selfInfo = await browser.management.getSelf();
  backupData.addonId = selfInfo.id;
  backupData.version = selfInfo.version;

  // Encode the backup as a JSON data URL.
  let jsonData = JSON.stringify(backupData, null, 2);
  let dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonData);

  // Prompt the user to download the backup.
  let a = window.document.createElement('a');
  a.href = dataUrl;
  a.download = backupData.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Restore settings froma JSON file which is uploaded.
async function restoreSettings () {
  let reader = new window.FileReader();
  reader.onload = async () => {
    try {
      // TODO Validate the backup version, etc.
      let backupData = JSON.parse(reader.result);
      populateSettings(backupData.settings);      
      alert('Settings copied from backup; please Save now.');
    } catch (error) {
      alert(`Failed to restore: ${error}`);
    }
  };
  reader.onerror = (error) => {
    alert(`Failed to restore: ${error}`);
  };
  reader.readAsText(el.fileRestoreSettings.files[0]);
}