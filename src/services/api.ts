import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import store from '../mobx/store';
import { IVideoEntity, IPlaylistYoutube } from '../types';
import { ffmpegPath } from './path';
import * as urlParser from 'js-video-url-parser';
import { getBasicInfo } from 'ytdl-core';
import { createVideoEntity } from '../factories/video-entity';
import * as ffmpeg from 'fluent-ffmpeg';
import { settingsManager } from './settings';
import { sync } from 'mkdirp';
import { existsSync } from 'fs';

export const downloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath(),             // Where is the FFmpeg binary located?
  outputPath: settingsManager.downloadsFolder,         // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: settingsManager.audioQuality,       // What video quality should be used?
  queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
  progressTimeout: 1000,                 // How long should be the interval of the progress reports
  filter: 'audio'
})
  .on('addToQueue', videoId => store.addToQueue(videoId))
  .on('gettingInfo', videoId => store.gettingInfo(videoId))
  .on('progress', ({videoId, progress}) => store.progress({videoId, progress}))
  .on('finished', (err, { videoId }) => store.finished(err, { videoId }))
  .on('error', err => {
    alert(`Sorry, something went wrong.\nPlease contact the author using "support" menu and just copy / paste the error:\n${err}\n Thanks!`);
    console.error(err);
  });

export function setFfmpegPath() {
  (ffmpeg as any).setFfmpegPath(ffmpegPath());
}

export function fetchVideos(term: string): Promise<IVideoEntity[]> {
  try {
    const parsedTerm = urlParser.parse(term);
    if (!parsedTerm) {
      return Promise.resolve([]);
    }
    if (parsedTerm.list) {
      return fetchVideosFromList(term);
    }
    return fetchVideoFromSingle(term);
  } catch (error) {
    console.error(error);
  }
}

async function fetchVideoFromSingle(videoUrl: string): Promise<IVideoEntity[]> {
  const { title, video_id } = await getBasicInfo(videoUrl);
  return [createVideoEntity(title, video_id)];
}

async function fetchVideosFromList(playlistUrl: string): Promise<IVideoEntity[]> {
  const data: IPlaylistYoutube = await ytlist(playlistUrl);
  const { data: {playlist} } = data;
  return playlist.map(video => createVideoEntity(video.name, video.id));
}

export function download(videoId: string);
export function download(videos: string[]);

export function download(videoOrVideos: string | string[]) {
  if (!existsSync(settingsManager.downloadsFolder)) {
    console.log(`Downloads Folder is not exist. Creating it: ${settingsManager.downloadsFolder}`);
    sync(settingsManager.downloadsFolder);
  }
  if (typeof videoOrVideos === 'string') {
    downloader.download(videoOrVideos);
  } else {
    videoOrVideos.forEach(video => {
      downloader.download(video);
    });
  }
}

console.log