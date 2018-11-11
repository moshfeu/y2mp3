import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IPlaylistYoutube, EVideoStatus } from './types';
import { join, resolve } from 'path';
import * as downloadsFolder from 'downloads-folder';
import { existsSync, mkdirSync } from 'fs';

const downloadsFolderName = 'YoutubePlaylistDownloader';
const DOWNLOADS_FOLDER = join(downloadsFolder(), downloadsFolderName);
!existsSync(DOWNLOADS_FOLDER) && mkdirSync(DOWNLOADS_FOLDER);
const ffmpegPath = resolve('./bin/ffmpeg');

const downloader = new YoutubeMp3Downloader({
  ffmpegPath,                           // Where is the FFmpeg binary located?
  outputPath: DOWNLOADS_FOLDER,         // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: 'highest',       // What video quality should be used?
  queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
  progressTimeout: 1000                 // How long should be the interval of the progress reports
});

export function fetchVideos(playlistUrl: string): Promise<IVideoEntity[]> {

  //Configure YoutubeMp3Downloader with your settings
  return ytlist(playlistUrl, 'id').
    then((data: IPlaylistYoutube) => {
    const { data: {playlist} } = data;
    return playlist.map(video => (<IVideoEntity>{
      id: video,
      progress: 0,
      status: EVideoStatus.NOT_STARTED
    }));
  });
}


export function getDownloader(video: IVideoEntity) {
  return downloader;
}
