import { videoInfo } from 'ytdl-core';

export interface IVideoEntity {
  id: string;
  name: string;
  progress: number;
  status: EVideoStatus;
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
    playlist: {
      id: string;
      name: string;
    }[];
  }
}

export interface IFetchVideosCallbacks {
  onBeforeGetInfoForDownload: (currentVideoIndex: number, info: videoInfo) => void;
  onAfterGetInfoForDownload: (currentVideoIndex: number, info: videoInfo) => void;
  onVideosFetched: (videos: IVideoEntity[]) => void;
  onVideoProgress: (videoIndex: number, progress: IDownloadProgress) => void;
  onDone: () => void;
}

export enum EVideoStatus {
  NOT_STARTED = 'Not Started',
  GETTING_INFO = 'Getting Data',
  PENDING = 'Pending',
  DOWNLOADING = 'Downloading',
  DONE = 'Done'
}