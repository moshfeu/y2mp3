import * as ffbinaries from 'ffbinaries';
import { mkdirSync, existsSync } from 'fs';
import { arch, platform } from 'os';
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

type Platform = 'windows-32' | 'windows-64' | 'linux-32' | 'linux-64' | 'linux-armhf' | 'linux-armel' | 'osx-64'

function getPlatform(): Platform {
  const currentPlatform = platform();
  const currentArch = arch();
  switch (currentPlatform) {
    case 'win32':
      if (currentArch === 'x64') {
        return 'windows-64';
      }
      return 'windows-32';
    case 'darwin': {
      return 'osx-64';
    }
    case 'linux': {
      throw 'linux are not yet supported'
    }
    default:
      break;
  }
}