import * as ffbinaries from 'ffbinaries';
import { existsSync } from 'fs';
import { ffmpegPath, APPDATA_FOLDER } from './path';
import { isFfmpegInPath } from './api';

export function installFfmpeg(tickerFn: (data) => void): Promise<void> {
  return new Promise((resolve) => {
    ffbinaries.downloadBinaries(['ffmpeg'], {destination: APPDATA_FOLDER, tickerFn}, function () {
      tickerFn({progress: 1});
      resolve();
    });
  });
}

export function isFFMpegInstalled(): boolean {
  console.log('isFFMpegInstalled');
  return isFfmpegInPath() || existsSync(ffmpegPath());
}
