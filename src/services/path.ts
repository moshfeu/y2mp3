import {join} from 'path';
import * as downloadsFolder from 'downloads-folder';
import { mkdirSync, existsSync, readdirSync } from 'fs';

const folderName = 'YoutubePlaylistDownloader';
const appDataFolder = process.argv
.find(arg => arg.includes('appData'))
.split('=')
.pop();

// const appDataFolder = '/Users/moshef/Library/Application Support/';

export const DOWNLOADS_FOLDER = join(downloadsFolder(), folderName);
if (!existsSync(DOWNLOADS_FOLDER)) {
  mkdirSync(DOWNLOADS_FOLDER);
}

export const APPDATA_FOLDER = join(appDataFolder, folderName);
// the file is different from os to os (.exe vs nothing)
const ffmpegFileName = () => readdirSync(APPDATA_FOLDER).find(file => file.includes('ffmpeg'));
export const ffmpegPath = () => {
  const ffmpegFile = ffmpegFileName();
  if (ffmpegFile) {
    return join(APPDATA_FOLDER, ffmpegFile);
  }
  return '';
};
console.log('ffmpegPath', ffmpegPath());