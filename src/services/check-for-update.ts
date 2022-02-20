import fetch from 'electron-fetch';
import { ipcRenderer } from 'electron';
import { showAppHasUpdate } from './modalsAndAlerts';
import store from '../mobx/store';


export async function checkForUpdateAndNotify() {
  const currentVersion = await ipcRenderer.invoke('version');
  const latestVersion = await fetch('https://api.github.com/repos/moshfeu/y2mp3/releases/latest')
                                .then(data => data.json())
                                .then(data => data.name.replace('v', ''));
  if (currentVersion !== latestVersion) {
    store.hasUpdate = true;
    showAppHasUpdate();
  }
}