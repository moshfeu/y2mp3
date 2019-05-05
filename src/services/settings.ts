import { DOWNLOADS_FOLDER } from './path';
import { downloader } from './api';
import { DownloadQuality } from 'youtube-mp3-downloader';

export interface IConfig {
  downloadsFolder: string;
  audioQuality: DownloadQuality;
  playlistFolder: boolean;
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
    return localStorage.getItem('playlistFolder') === 'true';
  }

  set playlistFolder(playlistFolder: boolean) {
    localStorage.setItem('playlistFolder', '' + playlistFolder);
  }
}

export const settingsManager = new SettingsManager();
