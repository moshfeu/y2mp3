import { DOWNLOADS_FOLDER } from './path';
import { downloader } from './api';

export interface IConfig {
  downloadsFolder: string;
}

class SettingsManager implements IConfig {
  get downloadsFolder(): string {
    return localStorage.getItem('downloadsFolder') || DOWNLOADS_FOLDER;
  }

  set downloadsFolder(path: string) {
    localStorage.setItem('downloadsFolder', path);
    downloader.setOutputPath(path);
  }
}

export const settingsManager = new SettingsManager();
