import * as YoutubeMp3Downloader from 'youtube-mp3-downloader';
import * as ytlist from 'youtube-playlist';
import { IVideoEntity, IDownloadProgress, IFetchVideosCallbacks, IPlaylistYoutube } from './types';
import * as path from 'path';
import * as downloadsFolder from 'downloads-folder';
import * as fs from 'fs';
import { videoInfo } from 'ytdl-core';

const downloadsFolderName = 'YoutubePlaylistDownloader';
const DOWNLOADS_FOLDER = path.join(downloadsFolder(), downloadsFolderName);
!fs.existsSync(DOWNLOADS_FOLDER) && fs.mkdirSync(DOWNLOADS_FOLDER);

export function fetchVideos(
  playlistUrl: string,
  {
    onBeforeGetInfoForDownload,
    onAfterGetInfoForDownload,
    onVideosFetched,
    onVideoProgress,
    onDone
  }: IFetchVideosCallbacks
  ): void {
  let videos: IVideoEntity[];
  let currentSize: number;

  //Configure YoutubeMp3Downloader with your settings
  const YD = new YoutubeMp3Downloader({
    // ffmpegPath,        // Where is the FFmpeg binary located?
    outputPath: DOWNLOADS_FOLDER,    // Where should the downloaded and encoded files be stored?
    youtubeVideoQuality: 'highest',       // What video quality should be used?
    queueParallelism: 1,                  // How many parallel downloads/encodes should be started?
    progressTimeout: 1000                 // How long should be the interval of the progress reports
  });

  const currentVideo = (): number => videos.length - currentSize;

  YD.on('finished', () => {
    onDone();
  });

  YD.on('error', (error: string) => {
    console.log(error);
  });

  YD.on('progress', ({ progress }) => {
    onVideoProgress(currentVideo(), progress);
  });

  YD.on('queueSize', (size: number) => {
    currentSize = size;
  });

  YD.on('beforeGetInfoForDownload', (info: videoInfo) => {
    onBeforeGetInfoForDownload(currentVideo(), info);
  });

  YD.on('afterGetInfoForDownload', (info: videoInfo) => {
    onAfterGetInfoForDownload(currentVideo(), info);
  });

  ytlist(playlistUrl, 'id').
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
