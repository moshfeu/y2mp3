import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IPlaylistYoutube, EVideoStatus } from '../types';
import { DOWNLOADS_FOLDER, ffmpegPath } from './path';

const downloader = new YoutubeMp3Downloader({
  ffmpegPath: ffmpegPath(),             // Where is the FFmpeg binary located?
  outputPath: DOWNLOADS_FOLDER,         // Where should the downloaded and encoded files be stored?
  youtubeVideoQuality: 'highest',       // What video quality should be used?
  queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
  progressTimeout: 1000                 // How long should be the interval of the progress reports
});

export function fetchVideos(playlistUrl: string): Promise<IVideoEntity[]> {

  //Configure YoutubeMp3Downloader with your settings
  try {
    return ytlist(playlistUrl, 'id').
      then((data: IPlaylistYoutube) => {
      const { data: {playlist} } = data;
      return playlist.map(video => (<IVideoEntity>{
        id: video,
        progress: 0,
        status: EVideoStatus.NOT_STARTED
      }));
    });
  } catch (error) {
    console.error(error);
  }
}


export function getDownloader(video: IVideoEntity) {
  return downloader;
}
