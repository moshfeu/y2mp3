import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IDownloadProgress, IFetchVideosCallbacks, IPlaylistYoutube, EVideoStatus } from './types';
import * as path from 'path';
import * as downloadsFolder from 'downloads-folder';
import * as fs from 'fs';
import { videoInfo } from 'ytdl-core';

const downloadsFolderName = 'YoutubePlaylistDownloader';
const DOWNLOADS_FOLDER = path.join(downloadsFolder(), downloadsFolderName);
!fs.existsSync(DOWNLOADS_FOLDER) && fs.mkdirSync(DOWNLOADS_FOLDER);

const downloader = new YoutubeMp3Downloader({
  // ffmpegPath,        // Where is the FFmpeg binary located?
  outputPath: DOWNLOADS_FOLDER,    // Where should the downloaded and encoded files be stored?
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
