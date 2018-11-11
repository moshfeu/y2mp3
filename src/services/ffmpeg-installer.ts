import * as ffbinaries from 'ffbinaries';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export function installFfmpeg(tickerFn: (data) => void): Promise<void> {
  const destination = join('.', 'bin');
  if (!existsSync(destination)) {
    mkdirSync(destination);
  }

  return new Promise((resolve) => {
    ffbinaries.downloadBinaries(['ffmpeg'], {destination, tickerFn}, function () {
      tickerFn({progress: 100});
      resolve();
    });
  });
}
