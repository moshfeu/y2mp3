import { DOWNLOADS_FOLDER } from './path';
import { downloader } from './api';
import { DownloadQuality } from 'youtube-mp3-downloader';

export interface IConfig {
  downloadsFolder: string;
  audioQuality: DownloadQuality;
  playlistFolder: boolean;
  autoPaste: boolean;
}

class SettingsManager implements IConfig {
  get downloadsFolder(): string {
    return localStorage.getItem('downloadsFolder') || DOWNLOADS_FOLDER;
  }

  set downloadsFolder(path: string) {
    localStorage.setItem('downloadsFolder', path);
    downloader.setOutputPath(path);
  }

  get audioQuality(): DownloadQuality {
    return localStorage.getItem('audioQuality') || 'highest';
  }

  set audioQuality(quality: DownloadQuality) {
    localStorage.setItem('audioQuality', '' + quality);
    downloader.setQuality(quality);
  }

  get playlistFolder(): boolean {
    return JSON.parse(localStorage.getItem('playlistFolder'));
  }

  set playlistFolder(playlistFolder: boolean) {
    localStorage.setItem('playlistFolder', '' + playlistFolder);
  }

  get autoPaste(): boolean {
    return JSON.parse(localStorage.getItem('autoPaste'));
  }

  set autoPaste(autoPaste: boolean) {
    localStorage.setItem('autoPaste', '' + autoPaste);
  }
}

export const settingsManager = new SettingsManager();
