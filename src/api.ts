import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IDownloadProgress } from './types';
import * as path from 'path';
import * as downloadsFolder from 'downloads-folder';
import * as fs from 'fs';

const downloadsFolderName = 'YoutubePlaylistDownloader';
const DOWNLOADS_FOLDER = path.join(downloadsFolder(), downloadsFolderName);
!fs.existsSync(DOWNLOADS_FOLDER) && fs.mkdirSync(DOWNLOADS_FOLDER);

interface IPlaylistYoutube {
  data: {
    playlist: string[];
  }
}

export function fetchVideos(
  playlistUrl: string,
  onVideosFetched: (videos: IVideoEntity[]) => void,
  onVideoProgress: (videoIndex: number, progress: IDownloadProgress) => void
  ) {
  //Configure YoutubeMp3Downloader with your settings
  let videos: IVideoEntity[];
  let currentSize: number;

  const YD = new YoutubeMp3Downloader({
    // ffmpegPath,        // Where is the FFmpeg binary located?
    outputPath: DOWNLOADS_FOLDER,    // Where should the downloaded and encoded files be stored?
    youtubeVideoQuality: 'highest',       // What video quality should be used?
    queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
    progressTimeout: 1000                 // How long should be the interval of the progress reports
  });

  YD.on("finished", function() {
      // console.log(JSON.stringify(data, null, 2));
      console.log('done');
  });

  // YD.on("error", function(error: string) {
  //     console.log(error);
  // });

  YD.on("progress", function(progress: any) {
    // onVideoProgress(videos.length - currentSize, progress);
    console.log(progress);
  });

  YD.on("queueSize", function(size: number) {
    currentSize = size;
    console.log('size', size);
  });

  return ytlist(playlistUrl, 'id').
    then((data: IPlaylistYoutube) => {
    const { data: {playlist} } = data;
    playlist.map(videoId => YD.download(videoId));
    videos = playlist.map(video => ({
      id: video,
      progress: 0
    }));
    onVideosFetched(videos);
  });

}
