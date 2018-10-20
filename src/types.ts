export interface IVideoEntity {
  id: string;
  progress: number;
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