import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IPlaylistYoutube, EVideoStatus } from '../types';
import { DOWNLOADS_FOLDER, ffmpegPath } from './path';
import * as urlParser from 'js-video-url-parser';
import { getBasicInfo } from 'ytdl-core';
import { createVideoEntity } from '../factories/video-entity';

import * as ffmpeg from 'fluent-ffmpeg';

export const downloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath(),             // Where is the FFmpeg binary located?
  outputPath: DOWNLOADS_FOLDER,         // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: 'highest',       // What video quality should be used?
  queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
  progressTimeout: 1000                 // How long should be the interval of the progress reports
});

export function setFfmpegPath() {
  // remove it when @types/ffmpeg will updated
  (ffmpeg as any).setFfmpegPath(ffmpegPath());
}

export function fetchVideos(term: string): Promise<IVideoEntity[]> {
  try {
    const parsedTerm = urlParser.parse(term);
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
