import { ITask, Queue } from './queue';
import * as ytdl from 'ytdl-core';
import { unlinkSync, rename, existsSync, createReadStream } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as progress from 'progress-stream';
import { settingsManager } from '../settings';
const sanitize = require('sanitize-filename');
import { videoFormats, audioFormats } from './options';
import { youtubeBaseUrl, cleanFileName, getVideoMetaData } from './utils';
import { IDownloadProgress } from '../../types';

export class YoutubeMp3Downloader {
  private outputPath: string;
  private filter: DownloadFilter;
  private format: DownloadFormat;
  private progressTimeout: number;
  private queue: Queue<IDownloadTask>;
  private youtubeVideoQuality: DownloadQuality;
  private outputOptions: string[];

  constructor(options: YoutubeMp3DownloaderOptions) {
    this.queue = new Queue();
    this.outputPath = options.outputPath;
    this.youtubeVideoQuality = options.youtubeVideoQuality;
    this.filter = options.filter;
    this.format = options.format;
    this.progressTimeout = options.progressTimeout;
    this.outputOptions = options.outputOptions || [];

    if (options && options.ffmpegPath) {
      ffmpeg.setFfmpegPath(options.ffmpegPath);
    }
  }

  download(videoId: string, onStateChanged: IDownloadTask['onStateChanged']) {
    onStateChanged({ state: 'added', payload: videoId });
    this.queue.add({
      id: videoId,
      main: this.performDownload,
      data: {
        videoId,
        onStateChanged,
      },
    });
  }

  private performDownload = (
    task: ITask<IDownloadTask>
  ): Promise<ITask<IDownloadTask>> => {
    return new Promise(async (resolve, reject) => {
      const fireError = (error: Error) => {
        reject(error);
        const customError = new Error(error.message);
        customError.name = 'custom';

        task.data.onStateChanged({
          state: 'error',
          error: customError,
          payload: {
            videoId: task.data.videoId,
          },
        });
      };

      task.data.onStateChanged({
        state: 'getting info',
        payload: task.data.videoId,
      });
      const videoUrl = youtubeBaseUrl + task.data.videoId;

      const resultObj = {
        videoId: task.data.videoId,
        stats: {},
        file: '',
        youtubeUrl: '',
        videoTitle: '',
        artist: '',
        title: '',
        thumbnail: '',
      };

      try {
        console.info(`getting info: ${task.data.videoId}`);
        const info = await ytdl.getInfo(videoUrl);
        const { videoDetails } = info;

        // that means that the download already canceled
        if (task.aborted) {
          console.info(`'${videoDetails.title}' was aborted`);
          return;
        }

        const videoTitle = cleanFileName(videoDetails.title);
        const fileName = sanitize(videoTitle) || videoDetails.videoId;
        const filePath = task.data.fileName
          ? this.outputPath + '/' + task.data.fileName
          : this.outputPath + '/' + fileName + '.' + this.format;

        const { title, artist, thumbnail } = getVideoMetaData(
          videoTitle,
          videoDetails
        );
        //Stream setup
        const stream = ytdl.downloadFromInfo(info, {
          quality: this.youtubeVideoQuality,
          filter: this.filter,
          // TODO fix format (currently throws a invalid input error [Doesn't tell much I know, but it's a late at night])
          // format: info.formats[2],
          requestOptions: { maxRedirects: 5 },
        });

        const { progressTimeout } = this;
        stream.on('response', (httpResponse) => {
          //Setup of progress module
          const str = progress({
            length: parseInt(httpResponse.headers['content-length']),
            time: progressTimeout,
          });

          //Add progress event listener
          str.on('progress', function (progress) {
            if (task.aborted) {
              console.info(`stream of '${videoDetails.title}' was aborted`);
              stream.destroy();
            }
            console.info(`progress: of '${videoDetails.title}'`, progress);
            if (progress.percentage === 100) {
              resultObj.stats = {
                transferredBytes: progress.transferred,
                runtime: progress.runtime,
                averageSpeed: parseFloat(progress.speed.toFixed(2)),
              };
            }
            task.data.onStateChanged({
              state: 'downloading',
              payload: {
                videoId: task.data.videoId,
                progress,
              },
            });
          });
          let outputOptions = ['-id3v2_version', '4'];
          if (this.outputOptions) {
            outputOptions = outputOptions.concat(this.outputOptions);
          }

          //Start encoding
          const proc = ffmpeg({
            source: stream.pipe(str),
          })
            .outputOptions(outputOptions)
            .addOutputOption('-metadata', `title=${title}`)
            .addOutputOption('-metadata', `artist=${artist}`)
            .on('error', fireError)
            .on('end', () => {
              console.info(`done: '${videoDetails.title}`);
              resultObj.file = filePath;
              resultObj.youtubeUrl = videoUrl;
              resultObj.videoTitle = videoTitle;
              resultObj.artist = artist;
              resultObj.title = title;
              resultObj.thumbnail = thumbnail;

              if (settingsManager.albumArt && this.format === 'mp3') {
                const tempFileName = filePath.replace(
                  fileName,
                  `${fileName}-ac`
                );
                const stream = createReadStream(filePath);
                ffmpeg(stream)
                  .on('error', (e) => {
                    console.error(
                      'error in adding cover',
                      JSON.stringify(e, null, 2)
                    );
                    task.data.onStateChanged({
                      state: 'error',
                      error: e,
                      payload: resultObj,
                    });
                    reject(e);
                  })
                  .on('end', () => {
                    task.data.onStateChanged({
                      state: 'done',
                      payload: resultObj,
                    });
                    resolve();
                    // once the new file saved, delete the original (w/o the album art) and rename the new to the original name
                    unlinkSync(filePath);
                    rename(tempFileName, filePath, () => ({}));
                    console.info(
                      `done to adding cover: '${videoDetails.title}`
                    );
                  })
                  .addInput(resultObj.thumbnail)
                  .addOutputOption(['-map', '0:0'])
                  .addOutputOption(['-map', '1:0'])
                  .addOutputOption('-c', 'copy')
                  // has to save it in a different name otherwise, ffmpeg take only the first 2 seconds (weird behaviour)
                  .saveToFile(tempFileName);
              } else {
                task.data.onStateChanged({ state: 'done', payload: resultObj });
                resolve();
              }
            });

          if (!(this.format in videoFormats)) {
            proc.withNoVideo();
          } else if (audioFormats[this.format]) {
            if (audioFormats[this.format].codec) {
              proc.withAudioCodec(audioFormats[this.format].codec);
            }
            proc.toFormat(audioFormats[this.format].format || this.format);
          }

          proc.saveToFile(filePath);
        });

        stream.on('error', fireError);
      } catch (error) {
        fireError(error);
      }
    });
  };

  cancelDownload(videoId: string) {
    this.queue.remove(videoId);
  }

  setOutputPath(path: string) {
    this.outputPath = path;
  }

  setQuality(quality: DownloadQuality) {
    this.youtubeVideoQuality = quality;
  }

  setFormat(format: DownloadFormat) {
    this.format = format;
  }
}

export type DownloadTaskState =
  | 'added'
  | 'getting info'
  | 'downloading'
  | 'done'
  | 'error';

export type StateChangeAction =
  | {
      state: 'added';
      payload: IVideoTask['videoId'];
    }
  | {
      state: 'getting info';
      payload: IVideoTask['videoId'];
    }
  | {
      state: 'downloading';
      payload: {
        videoId: IDownloadTask['videoId'];
        progress: IDownloadProgress;
      };
    }
  | {
      state: 'done';
      payload: { videoId: string; thumbnail: string; videoTitle: string };
    }
  | {
      state: 'error';
      error: Error;
      payload: Partial<IVideoTask>;
    };

interface IDownloadTaskGeneric {
  videoId: string;
  fileName?: string;
  onStateChanged(action: StateChangeAction): void;
}

export interface IDownloadTask extends IDownloadTaskGeneric {
  onStateChanged(action: StateChangeAction): void;
}

export type DownloadFilter = ytdl.downloadOptions['filter'];
export type DownloadQuality = 'lowest' | 'highest' | string | number;
export type DownloadFormat =
  | 'mp3'
  | 'ogg'
  | 'wav'
  | 'flac'
  | 'm4a'
  | 'wma'
  | 'aac'
  | 'mp4'
  | 'mpg'
  | 'wmv';

interface YoutubeMp3DownloaderOptions {
  ffmpegPath: string;
  outputPath: string;
  youtubeVideoQuality: DownloadQuality;
  filter: DownloadFilter;
  format: DownloadFormat;
  progressTimeout: number;
  outputOptions?: string[];
}

export interface IVideoTask {
  videoId: string;
  // https://github.com/freeall/progress-stream#usage
  progress: {
    percentage: number;
    transferred: number;
    length: number;
    remaining: number;
    eta: number;
    runtime: number;
    delta: number;
    speed: number;
  };
}
