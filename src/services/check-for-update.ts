import { ipcRenderer } from 'electron';
import axios from 'axios';
import { showAppHasUpdate } from './modalsAndAlerts';
import store from '../mobx/store';

const fetch = <T extends unknown>(url: string) => new Promise<{
  json: () => T,
  text: () => string,
}>(async (resolve, reject) => {
  try {
    const request = await axios.request({
      url,
      method: 'GET',
    });
    if (request.status >= 200 && request.status < 300) {
      resolve({
        json: () => request.data,
        text: () => JSON.stringify(request.data),
      });
    } else {
      reject(request.statusText);
    }
  } catch (error) {
    console.error(error);
    reject(error);
  }
});

export async function checkForUpdateAndNotify() {
  const currentVersion = await ipcRenderer.invoke('version');
  const latestVersion = await fetch<{ name: string }>('https://api.github.com/repos/moshfeu/y2mp3/releases/latest')
    .then(data => data.json())
    .then(data => data.name.replace('v', ''));
  if (currentVersion !== latestVersion) {
    store.hasUpdate = true;
    showAppHasUpdate();
  }
}