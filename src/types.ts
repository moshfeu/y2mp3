import { videoInfo } from 'ytdl-core';

export interface IVideoEntity {
  id: string;
  progress: number;
  status?: 'getting info for download' | 'preperare to download and convert' | 'done';
}

export interface IDownloadProgress {
  percentage: number;
  transferred: number;
  length: number;
  remaining: number;
  eta: number;
  runtime: number;
  delta: number;
  speed: number;
}

export interface IPlaylistYoutube {
  data: {
    playlist: string[];
  }
}

export interface IFetchVideosCallbacks {
  onBeforeGetInfoForDownload: (currentVideoIndex: number, info: videoInfo) => void;
  onAfterGetInfoForDownload: (currentVideoIndex: number, info: videoInfo) => void;
  onVideosFetched: (videos: IVideoEntity[]) => void;
  onVideoProgress: (videoIndex: number, progress: IDownloadProgress) => void;
  onDone: () => void;
}