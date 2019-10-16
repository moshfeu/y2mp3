import * as ffbinaries from 'ffbinaries';
import { existsSync } from 'fs';
import { ffmpegPath, APPDATA_FOLDER } from './path';
import { isFfmpegInPath } from './api';

export function installFfmpeg(tickerFn: (data: ffbinaries.Progress) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    ffbinaries.downloadBinaries(['ffmpeg'], {destination: APPDATA_FOLDER, tickerFn}, (error: string) => {
      if (error) {
        reject(error);
      } else {
        tickerFn({progress: 1});
        resolve();
      }
    });
  });
}

export function isFFMpegInstalled(): boolean {
  return isFfmpegInPath() || existsSync(ffmpegPath());
}
