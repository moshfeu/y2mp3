import { ITask, Queue } from './queue';
import ytdl = require('ytdl-core');
import { unlinkSync, rename } from 'fs';
const ffmpeg = require('fluent-ffmpeg');
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

  constructor(options: YoutubeMp3DownloaderOptions) {
    this.queue = new Queue();
    this.outputPath = options.outputPath;
    this.youtubeVideoQuality = options.youtubeVideoQuality;
    this.filter = options.filter;
    this.format = options.format;
    this.progressTimeout = options.progressTimeout;

    if (options && options.ffmpegPath) {
      ffmpeg.setFfmpegPath(options.ffmpegPath);
    }
  }

  download(videoId: string, onStateChanged: IDownloadTask['onStateChanged']) {
    onStateChanged('added', videoId);
    this.queue.add({
      id: videoId,
      main: this.performDownload,
      data: {
        videoId,
        onStateChanged
      }
    });
  }

  private performDownload = (task: ITask<IDownloadTask>): Promise<ITask<IDownloadTask>> => {
    return new Promise(async (resolve, reject) => {
      task.data.onStateChanged('getting info', task.data.videoId);
      const videoUrl = youtubeBaseUrl + task.data.videoId;

      const resultObj = {
        videoId: task.data.videoId,
        stats: {},
        file: '',
        youtubeUrl: '',
        videoTitle: '',
        artist: '',
        title: '',
        thumbnail: ''
      };

      try {
        console.info(`getting info: ${task.data.videoId}`);
        const info = await ytdl.getInfo(videoUrl, {
          quality: this.youtubeVideoQuality,
          filter: this.filter
        });

        // that means that the download already canceled
        if (task.aborted) {
          console.info(`'${info.title}' was aborted`);
          return;
        }

        const videoTitle = cleanFileName(info.title);
        const fileName = (sanitize(videoTitle) || info.video_id);
        const filePath = task.data.fileName
          ? this.outputPath + '/' + task.data.fileName
          : this.outputPath +
            '/' +
            fileName +
            '.' +
            this.format;

        const { title, artist, thumbnail } = getVideoMetaData(videoTitle, info);

        //Stream setup
        const stream = ytdl.downloadFromInfo(info, {
          quality: this.youtubeVideoQuality,
          requestOptions: { maxRedirects: 5 }
        });

        const { progressTimeout } = this;
        stream.on('response', function(httpResponse) {
          //Setup of progress module
          const str = progress({
            length: parseInt(httpResponse.headers['content-length']),
            time: progressTimeout
          });

          //Add progress event listener
          str.on('progress', function(progress) {
            if (task.aborted) {
              console.info(`stream of '${info.title}' was aborted`);
              stream.destroy();
            }
            console.info(`progress: of '${info.title}'`, progress);
            if (progress.percentage === 100) {
              resultObj.stats = {
                transferredBytes: progress.transferred,
                runtime: progress.runtime,
                averageSpeed: parseFloat(progress.speed.toFixed(2))
              };
            }
            task.data.onStateChanged('downloading', {
              videoId: task.data.videoId,
              progress
            });
          });
          let outputOptions = ['-id3v2_version', '4'];
          if (this.outputOptions) {
            outputOptions = outputOptions.concat(this.outputOptions);
          }

          //Start encoding
          const proc = new ffmpeg({
            source: stream.pipe(str)
          })
            .outputOptions(outputOptions)
            .addOutputOption('-metadata', `title=${title}`)
            .addOutputOption('-metadata', `artist=${artist}`)
            .on('error', function(err) {
              task.data.onStateChanged('error', err, {videoId: task.data.videoId});
              reject(err);
            })
            .on('end', function() {
              console.info(`done: '${info.title}`);
              resultObj.file = filePath;
              resultObj.youtubeUrl = videoUrl;
              resultObj.videoTitle = videoTitle;
              resultObj.artist = artist;
              resultObj.title = title;
              resultObj.thumbnail = thumbnail;

              if (settingsManager.albumArt) {
                const tempFileName = filePath.replace(
                  fileName,
                  `${fileName}-ac`
                );

                ffmpeg(filePath)
                  .on('error', e => {
                    console.error(
                      'error in adding cover',
                      JSON.stringify(e, null, 2)
                    );
                    task.data.onStateChanged('error', e, resultObj);
                    reject(e);
                  })
                  .on('end', () => {
                    task.data.onStateChanged('done', resultObj);
                    resolve();
                    // once the new file saved, delete the original (w/o the album art) and rename the new to the original name
                    unlinkSync(filePath);
                    rename(tempFileName, filePath, () => ({}));
                    console.info(`done to adding cover: '${info.title}`);
                  })
                  .addInput(resultObj.thumbnail)
                  .addOutputOption(['-map', '0:0'])
                  .addOutputOption(['-map', '1:0'])
                  .addOutputOption('-c', 'copy')
                  // has to save it in a different name otherwise, ffmpeg take only the first 2 seconds (weird behaviour)
                  .saveToFile(tempFileName);
              } else {
                task.data.onStateChanged('done', resultObj);
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
      } catch (error) {
        task.data.onStateChanged('error', error, {videoId: task.data.videoId});
        reject(error);
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

export type DownloadTaskState = 'added' | 'getting info' | 'downloading' | 'done' | 'error';

interface IDownloadTaskGeneric {
  videoId: string;
  fileName?: string;
  onStateChanged(state: DownloadTaskState, ...args: any): void;
}

export interface IDownloadTask extends IDownloadTaskGeneric {
  onStateChanged(state: 'added', videoId: IVideoTask['videoId']): void;
  onStateChanged(state: 'getting info', task: IVideoTask['videoId']): void;
  onStateChanged(state: 'downloading', {videoId, progress}: {videoId: IDownloadTask['videoId'], progress: IDownloadProgress}): void;
  onStateChanged(state: 'done', { videoId, thumbnail, videoTitle }: {videoId: string, thumbnail: string; videoTitle: string}): void;
  onStateChanged(state: 'error', err: object, {videoId}: Partial<IVideoTask>): void;
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
  }
}