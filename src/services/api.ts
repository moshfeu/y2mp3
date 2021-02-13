import { join } from 'path';
import { sync } from 'mkdirp';
import { existsSync } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { getBasicInfo } from 'ytdl-core';
import * as urlParser from 'js-video-url-parser';
import { sync as commandExistsSync } from 'command-exists';
import {
  YoutubeMp3Downloader,
  StateChangeAction,
} from './youtube-mp3-downloader';
import store from '../mobx/store';
import { ffmpegPath } from './path';
import { IVideoEntity, IDownloadProgress } from '../types';
import { settingsManager } from './settings';
import { showCustomError } from './modalsAndAlerts';
import { createVideoEntity } from '../factories/video-entity';
import { downloading, gettingInfo, inResult, clear } from './tray-messanger';
import { scrap } from './playlist-scraper';

export function isFfmpegInPath() {
  return commandExistsSync('ffmpeg');
}

export const downloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath(), // Where is the FFmpeg binary located?
  outputPath: settingsManager.downloadsFolder, // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: settingsManager.audioQuality, // What video quality should be used?
  filter: 'audio',
  format: settingsManager.downloadFormat,
  progressTimeout: 1000,
});

function finishVideoOnError(err, videoId: string) {
  store.progress({
    videoId,
    progress: {
      delta: 0,
      eta: 0,
      length: 0,
      percentage: 100,
      transferred: 0,
      remaining: 0,
      runtime: 0,
      speed: 0,
    },
  });
  store.finished(err, { videoId });
}

export function setFfmpegPath() {
  (ffmpeg as any).setFfmpegPath(ffmpegPath());
}

export function isYoutubeURL(url: string): boolean {
  return !!url && !!urlParser.parse(url);
}

export function fetchVideos(term: string): Promise<IVideoEntity[]> {
  const parsedTerm = urlParser.parse(term);
  if (!parsedTerm) {
    return Promise.resolve([]);
  }
  if (parsedTerm.list) {
    return fetchVideosFromList(term);
  }
  return fetchVideoFromSingle(term);
}

async function fetchVideoFromSingle(videoUrl: string): Promise<IVideoEntity[]> {
  try {
    const {
      videoDetails: { title, videoId },
    } = await getBasicInfo(videoUrl);
    return [createVideoEntity(title, videoId)];
  } catch (error) {
    return [];
  }
}

async function fetchVideosFromList(
  playlistUrl: string
): Promise<IVideoEntity[]> {
  try {
    const data = await scrap(playlistUrl);
    console.log(data);
    const { playlist, name } = data;
    return (
      playlist
        // .filter((video) => !video.isPrivate)
        .map((video) => createVideoEntity(video.name, video.id, name))
    );
  } catch (error) {
    console.log(error);
  }
}

export function download(videoId: IVideoEntity): void;
export function download(videos: IVideoEntity[]): void;

export function download(videoOrVideos: IVideoEntity | IVideoEntity[]) {
  if (videoOrVideos instanceof Array) {
    videoOrVideos.forEach(performDownload);
  } else {
    performDownload(videoOrVideos);
  }
}

export function removeAllVideos() {
  store.videos.forEach((video) => downloader.cancelDownload(video.id));
  store.videos = [];
}

// not in use currently
export function removeVideo(videoId: string) {
  store.removeVideo(videoId);
  downloader.cancelDownload(videoId);
  if (store.videos.length) {
    inResult();
  } else {
    clear();
  }
}

export async function search(url: string) {
  await store.search(url);
  inResult();
}

function setVideoDownloadPath(video: IVideoEntity) {
  const getFinalPath = (): string => {
    if (settingsManager.playlistFolder && video.playlistName) {
      return join(settingsManager.downloadsFolder, video.playlistName);
    }
    return settingsManager.downloadsFolder;
  };

  const path = getFinalPath();
  if (!existsSync(path)) {
    console.log(`Downloads Folder is not exist. Creating it: ${path}`);
    sync(path);
  }

  downloader.setOutputPath(path);
}

function performDownload(video: IVideoEntity) {
  setVideoDownloadPath(video);
  downloader.download(video.id, downloadReducer);
}

const downloadReducer = (action: StateChangeAction) => {
  switch (action.state) {
    case 'added':
      {
        const { payload: videoId } = action;
        store.addToQueue(videoId);
      }
      break;
    case 'getting info':
      {
        const { payload: videoId } = action;
        gettingInfo(videoId);
        store.gettingInfo(videoId);
      }
      break;
    case 'downloading':
      {
        const {
          payload: { videoId, progress },
        } = action;
        const video = store.getVideo(videoId);
        if (video) {
          downloading(videoId, progress.speed, progress.eta);
          store.progress({ videoId, progress }, video);
        }
      }
      break;
    case 'done':
      {
        const {
          payload: { videoId, thumbnail, videoTitle },
        } = action;

        store.finished(null, { videoId });
        if (videoTitle && settingsManager.notificationWhenDone) {
          new Notification('Download completed', {
            icon: './app-resources/logo-128.png',
            body: `The video "${videoTitle}" downloaded successfully`,
            image: thumbnail,
          });
        }
      }
      break;
    case 'error':
      {
        const {
          payload: { videoId },
          error,
        } = action;
        finishVideoOnError(error, videoId);
        if (isCustomError(error)) {
          showCustomError(error.message);
          break;
        } else {
          alert(
            `Sorry, something went wrong.\nPlease contact the author using "support" menu and just copy / paste the error:\n${error}\n Thanks!`
          );
          console.error(error);
        }
      }
      break;
  }
};

function isCustomError(error: Error | object) {
  return (
    error instanceof Error &&
    // https://commons.wikimedia.org/wiki/File:YouTube_blocked_UMG_country_en.png
    (error.message.includes('UMG') || error.name === 'custom')
  );
}
