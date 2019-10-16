import YoutubeMp3Downloader from './youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import store from '../mobx/store';
import { IVideoEntity, IPlaylistYoutube, IDownloadProgress } from '../types';
import { ffmpegPath } from './path';
import * as urlParser from 'js-video-url-parser';
import { getBasicInfo } from 'ytdl-core';
import { createVideoEntity } from '../factories/video-entity';
import * as ffmpeg from 'fluent-ffmpeg';
import { settingsManager } from './settings';
import { sync } from 'mkdirp';
import { existsSync } from 'fs';
import { join } from 'path';
import { sync as commandExistsSync } from 'command-exists';
import { downloading, gettingInfo } from './tray-messanger';

export function isFfmpegInPath() {
  return commandExistsSync('ffmpeg');
}

export const downloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath(),             // Where is the FFmpeg binary located?
  outputPath: settingsManager.downloadsFolder,         // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: settingsManager.audioQuality,       // What video quality should be used?
  queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
  progressTimeout: 1000,                 // How long should be the interval of the progress reports
  filter: 'audio',
  format: settingsManager.downloadFormat,
})
  .on('addToQueue', videoId => store.addToQueue(videoId))
  .on('gettingInfo', videoId => {
    gettingInfo(videoId);
    store.gettingInfo(videoId)
  })
  .on('progress', ({videoId, progress}: {videoId: string, progress: IDownloadProgress}) => {
    downloading(videoId, progress.speed, progress.eta);
    store.progress({videoId, progress})
  })
  .on('finished', (err, { videoId, thumbnail, videoTitle }) => {
    store.finished(err, { videoId })
    if (settingsManager.notificationWhenDone) {
      new Notification('Download completed', {
        icon: './app-resources/logo-128.png',
        body: `The video "${videoTitle}" downloaded successfully`,
        image: thumbnail
      });
    }
  })
  .on('error', (err, { videoId }) => {
    alert(`Sorry, something went wrong.\nPlease contact the author using "support" menu and just copy / paste the error:\n${err}\n Thanks!`);
    console.error(err);
    finishVideoOnError(err, videoId);
  });

function finishVideoOnError(err, videoId: string) {
  store.progress({videoId, progress: {
    delta: 0,
    eta: 0,
    length: 0,
    percentage: 100,
    transferred: 0,
    remaining: 0,
    runtime: 0,
    speed: 0
  }})
  store.finished(err, { videoId })
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
    const { title, video_id } = await getBasicInfo(videoUrl);
    return [createVideoEntity(title, video_id)];
  } catch (error) {
    return [];
  }
}

async function fetchVideosFromList(playlistUrl: string): Promise<IVideoEntity[]> {
  const data: IPlaylistYoutube = await ytlist(playlistUrl);
  console.log(data);
  const { data: {playlist, name} } = data;
  return playlist
    .filter(video => !video.isPrivate)
    .map(video => createVideoEntity(video.name, video.id, name));
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

function setVideoDownloadPath(video: IVideoEntity) {
  const getFinalPath = (): string => {
    if (settingsManager.playlistFolder && video.playlistName) {
      return join(settingsManager.downloadsFolder, video.playlistName);
    }
    return settingsManager.downloadsFolder;
  }

  const path = getFinalPath();
  if (!existsSync(path)) {
    console.log(`Downloads Folder is not exist. Creating it: ${path}`);
    sync(path);
  }

  downloader.setOutputPath(path);
}

function performDownload(video: IVideoEntity) {
  setVideoDownloadPath(video);
  downloader.download(video.id);
}
