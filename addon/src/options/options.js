'use strict';

const el = {
  optionsForm: document.getElementById('options-form'), 
  buttonAddComfyDomain: document.getElementById('add-comfy-domain'),
  buttonBackupSettings: document.getElementById('backup-settings'),
  fileRestoreSettings: document.getElementById('restore-settings'),
  tbodyComfyDomainList: document.getElementById('comfy-domain-list'),
  templateComfyDomain: document.getElementById('comfy-domain-template')
};

chrome.storage.local.get({
  comfyDomains: []
}).then(populateSettings);

// Bind event handlers to the form.
el.buttonAddComfyDomain.addEventListener('click', () => createComfyDomainsConfig('').scrollIntoView());
el.buttonBackupSettings.addEventListener('click', () => backupSettings());
el.optionsForm.addEventListener('submit', saveOptions);
el.fileRestoreSettings.addEventListener('change', () => restoreSettings());


function populateSettings (results) {
  // Restore the options from local stoage.
  // Restore the options from local stoage.
  el.tbodyComfyDomainList.innerText = '';  
  results.comfyDomains.forEach(createComfyDomainsConfig);
}

function createComfyDomainsConfig(pattern) {
  let template = document.importNode(el.templateComfyDomain.content, true);
  let tpl = {
    divComfyDomain: template.firstElementChild,    
    inputPattern: template.querySelector('[name="pattern"]'),
    buttonDelete: template.querySelector('button.delete'),     
  };
  tpl.inputPattern.value = pattern;
  tpl.buttonDelete.addEventListener('click', () => tpl.divComfyDomain.parentNode.removeChild(tpl.divComfyDomain));
  el.tbodyComfyDomainList.appendChild(template);
  return tpl.divComfyDomain;
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

  let comfyDomains = Array.from(el.tbodyComfyDomainList.querySelectorAll('input[name=pattern]'))
    .map(el => el.value)
    .filter(p => p);

  // Obtain host permissions for all of the domains.
  let result = await chrome.permissions.request({
    origins: comfyDomains
  });
  if (!result) {
    alert('Reqeusted permissions were not granted');
    return;
  }  
  
  try {
    // Register the content script for all of the domain.
    await chrome.scripting.updateContentScripts([{
      id: 'activator',
      js: [ '/content/activator.js' ],
      matches: comfyDomains,
      runAt: 'document_start',
      persistAcrossSessions: true
    }]);      
  } catch (ex) {
    console.error(ex);
    alert('Failed to register content scripts');
    return;
  }

  // Save all settings.
  await chrome.storage.local.set({
    comfyDomains
  });

  alert('Settings have been saved');
}

// Backup settings to a JSON file which is downloaded.
async function backupSettings () {
  // Get the settings to be backed up.
  let backupSettings = await chrome.storage.local.get({
    comfyDomains: []
  });

  // Wrap the settings in an envelope.
  let backupData = {};
  backupData.settings = backupSettings;
  backupData.timestamp = new Date();
  backupData.fileName = 'comfyUiLiebsPicker.' + [
    String(backupData.timestamp.getFullYear()),
    String(backupData.timestamp.getMonth() + 1).padStart(2, '0'),
    String(backupData.timestamp.getDate()).padStart(2, '0')
  ].join('-') + '.json';
  // Record the current addon version.
  let selfInfo = await chrome.management.getSelf();
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