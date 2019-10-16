import { DOWNLOADS_FOLDER } from './path';
import { downloader } from './api';
import { DownloadQuality, DownloadFormat } from '../services/youtube-mp3-downloader';

export interface IConfig {
  downloadsFolder: string;
  audioQuality: DownloadQuality;
  playlistFolder: boolean;
  autoPaste: boolean;
  checkForUpdate: boolean;
  albumArt: boolean;
  notificationWhenDone: boolean;
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
    return JSON.parse(localStorage.getItem('autoPaste') || 'true');
  }

  set autoPaste(autoPaste: boolean) {
    localStorage.setItem('autoPaste', '' + autoPaste);
  }

  get checkForUpdate(): boolean {
    return JSON.parse(localStorage.getItem('checkForUpdate') || 'false');
  }

  set checkForUpdate(checkForUpdate: boolean) {
    localStorage.setItem('checkForUpdate', '' + checkForUpdate);
  }

  get albumArt(): boolean {
    return JSON.parse(localStorage.getItem('albumArt') || 'true');
  }

  set albumArt(albumArt: boolean) {
    localStorage.setItem('albumArt', '' + albumArt);
  }

  get notificationWhenDone(): boolean {
    return JSON.parse(localStorage.getItem('notificationWhenDone') || 'true');
  }

  set notificationWhenDone(notificationWhenDone: boolean) {
    localStorage.setItem('notificationWhenDone', '' + notificationWhenDone);
  }

  get downloadFormat(): DownloadFormat {
    return (localStorage.getItem('downloadFormat') || 'mp3') as DownloadFormat;
  }

  set downloadFormat(downloadFormat: DownloadFormat) {
    localStorage.setItem('downloadFormat', downloadFormat);
    downloader.setFormat(downloadFormat);
  }
}

export const settingsManager = new SettingsManager();
