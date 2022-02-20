import { ipcRenderer } from 'electron';
import store from '../mobx/store';

const CHANNEL_NAME = 'tray';

function getVideoName(videoId: string): string {
  return store.videos.find(v => v.id == videoId)?.name || '';
}

export function inResult() {
  ipcRenderer.send(CHANNEL_NAME, `Found ${store.videos.length} results`);
}

export function gettingInfo(videoId: string) {
  ipcRenderer.send(CHANNEL_NAME, `Getting info for "${getVideoName(videoId)}"`);
}

export function downloading(videoId: string, speed: number, eta: number) {
  try {
    const name = getVideoName(videoId);
    ipcRenderer.send(CHANNEL_NAME, `Downloading "${name}". Speed: ${(speed / 1000).toFixed(2)}kb/s. ETA: ${eta}s`);
  } catch (error) {
    console.error(error);
  }
}

export function clear() {
  ipcRenderer.send(CHANNEL_NAME, 'Click to focus');
}