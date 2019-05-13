import { videoInfo } from 'ytdl-core';
import { SemanticCOLORS } from 'semantic-ui-react';

export interface IVideoEntity {
  id: string;
  name: string;
  progress: number;
  status: EVideoStatus;
  playlistName: string;
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
    name?: string;
    playlist: {
      id: string;
      name: string;
      isPrivate: boolean;
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

export interface IModalProps {
  open: boolean;
  onClose: () => void;
}

export enum EVideoStatus {
  NOT_STARTED = 'Not Started',
  GETTING_INFO = 'Getting Data',
  PENDING = 'Pending',
  DOWNLOADING = 'Downloading',
  DONE = 'Done'
}

export interface IDropdownOption {
  text: string;
  value: string;
}

export enum EWindowEvents {
  OPEN_ABOUT = 'open-about',
  OPEN_PREFERENCES = 'open-preferences',
  WINDOW_FOCUS = 'window-focus'
}

export type MessagePosition = 'top' | 'bottom';
export type MessageContent = string | JSX.Element;
export interface IMessage {
  isVisible: boolean;
  position?: MessagePosition,
  color?: SemanticCOLORS;
  content?: MessageContent;
}