"use strict";
const ffmpeg = require('fluent-ffmpeg');
const sanitize = require('sanitize-filename');
import * as os from 'os';
import * as util from 'util';
import * as EventEmitter from 'events';
import * as ytdl from 'ytdl-core';
import * as async from 'async';
import * as progress from 'progress-stream';
import { audioFormats, videoFormats } from './options';
import { settingsManager } from '../settings';
import { unlinkSync, rename } from 'fs';

function YoutubeMp3Downloader(options) {
    const self: YoutubeMp3DownloaderClass = this;

    self.youtubeBaseUrl = "http://www.youtube.com/watch?v=";
    self.youtubeVideoQuality = (options && options.youtubeVideoQuality ? options.youtubeVideoQuality : "highest");
    self.outputPath = (options && options.outputPath ? options.outputPath : (os.platform() === "win32" ? "C:/Windows/Temp" : "/tmp"));
    self.queueParallelism = (options && options.queueParallelism ? options.queueParallelism : 1);
    self.progressTimeout = (options && options.progressTimeout ? options.progressTimeout : 1000);
    self.fileNameReplacements = [[/"/g, ""], [/'/g, ""], [/\//g, ""], [/\?/g, ""], [/:/g, ""], [/;/g, ""]];
    self.requestOptions = (options && options.requestOptions ? options.requestOptions : { maxRedirects: 5 });
    self.outputOptions = (options && options.outputOptions ? options.outputOptions : []);
    self.filter = (options && options.filter ? options.filter : null);
    self.format = (options && options.format ? options.format : 'mp3');
    self.stream = undefined;

    if (options && options.ffmpegPath) {
        ffmpeg.setFfmpegPath(options.ffmpegPath);
    }

    //Async download/transcode queue
    self.downloadQueue = async.queue(function (task, callback: Function) {
        self.emit("queueSize", self.downloadQueue.running() + self.downloadQueue.length());
        task.abort = callback;
        self.performDownload(task, function(err, result) {
          callback(err, result);
        });

    }, self.queueParallelism);

}

util.inherits(YoutubeMp3Downloader, EventEmitter);

YoutubeMp3Downloader.prototype.setOutputPath = function(path: string) {
  this.outputPath = path;
}

YoutubeMp3Downloader.prototype.setQuality = function(quality: DownloadQuality) {
  this.youtubeVideoQuality = quality;
}

YoutubeMp3Downloader.prototype.setFormat = function(format: DownloadFormat) {
  this.format = format;
}

YoutubeMp3Downloader.prototype.cleanFileName = function(fileName: string) {
    const self = this;

    self.fileNameReplacements.forEach(function(replacement) {
        fileName = fileName.replace(replacement[0], replacement[1]);
    });

    return fileName;
};

YoutubeMp3Downloader.prototype.download = function(videoId: string, fileName: string) {

    const self: YoutubeMp3DownloaderClass = this;
    const task: IDownloadTask = {
        videoId: videoId,
        fileName: fileName
    };
    self.emit("addToQueue", videoId);
    self.downloadQueue.push(task, function (err, data) {
        self.emit("queueSize", self.downloadQueue.running() + self.downloadQueue.length());

        if (err) {
          self.emit("error", err, task);
        } else {
          self.emit("finished", err, data);
        }
        if (self.downloadQueue.length() === 0) {
          self.emit("doneAll");
        }
    });
};

YoutubeMp3Downloader.prototype.cancelDownload = function(videoId: string) {
  const self: YoutubeMp3DownloaderClass = this;
  const task = self.downloadQueue.workersList().find(v => v.data.videoId === videoId);
  // if video is not yet in the tasks
  if (task) {
    task.data.aborted = true;
    task.data.abort && task.data.abort(null, {videoId});
    self.downloadQueue.remove(v => v.data.videoId === videoId);
  }
}

YoutubeMp3Downloader.prototype.performDownload = function(task, callback) {

    const self: YoutubeMp3DownloaderClass = this;
    const videoUrl = self.youtubeBaseUrl+task.videoId;
    const resultObj = {
      videoId: task.videoId,
      stats: {},
      file: '',
      youtubeUrl: '',
      videoTitle: '',
      artist: '',
      title: '',
      thumbnail: '',
    };

    self.emit("gettingInfo", task.videoId);
    ytdl.getInfo(videoUrl, {
      quality: self.youtubeVideoQuality,
      filter: self.filter
    }).then( function(info) {
        // that means that the download already canceled
        if (task.aborted) {
          console.log(`"${info.title}" was deleted`);
          return;
        }
        try {
          const videoTitle = self.cleanFileName(info.title);
          const fileName = (task.fileName ? self.outputPath + "/" + task.fileName : self.outputPath + "/" + (sanitize(videoTitle) || info.video_id) + "." + self.format);
          let artist = "Unknown";
          let title = "Unknown";
          const thumbnail = `https://img.youtube.com/vi/${task.videoId}/mqdefault.jpg`;
          if (videoTitle.indexOf("-") > -1) {
              const temp = videoTitle.split("-");
              if (temp.length >= 2) {
                  artist = temp[0].trim();
                  title = temp[1].trim();
              }
          } else {
              title = videoTitle;
          }

          if (info.author && info.author.name) {
            artist = info.author.name;
          }

          //Stream setup
          const stream = ytdl.downloadFromInfo(info, {
              quality: self.youtubeVideoQuality,
              requestOptions: self.requestOptions
          });

          stream.on("response", function(httpResponse) {
              //Setup of progress module
              const str = progress({
                  length: parseInt(httpResponse.headers["content-length"]),
                  time: self.progressTimeout
              });

              //Add progress event listener
              str.on("progress", function(progress) {
                  if (progress.percentage === 100) {
                      resultObj.stats = {
                          transferredBytes: progress.transferred,
                          runtime: progress.runtime,
                          averageSpeed: parseFloat(progress.speed.toFixed(2))
                      }
                  }
                  console.log('before progress!');
                  self.emit("progress", {videoId: task.videoId, progress: progress})
              });
              let outputOptions = [
                "-id3v2_version", "4"
              ];
              if (self.outputOptions) {
                outputOptions = outputOptions.concat(self.outputOptions);
              }

              //Start encoding
              const proc = new ffmpeg({
                  source: stream.pipe(str)
              })
              .outputOptions(outputOptions)
              .addOutputOption("-metadata", `title=${title}`)
              .addOutputOption("-metadata", `artist=${artist}`)
              .on("error", function(err) {
                  callback(err.message, null);
              })
              .on("end", function() {
                  resultObj.file =  fileName;
                  resultObj.youtubeUrl = videoUrl;
                  resultObj.videoTitle = videoTitle;
                  resultObj.artist = artist;
                  resultObj.title = title;
                  resultObj.thumbnail = thumbnail;

                if (settingsManager.albumArt) {
                  const tempFileName = fileName.replace(resultObj.title, `${resultObj.title}-ac`);

                  ffmpeg(fileName)
                    .on('error', e => {
                      console.error('error in adding cover', JSON.stringify(e, null, 2))
                      callback(e, resultObj);
                    })
                    .on('end', () => {
                      callback(null, resultObj);
                      // once the new file saved, delete the original (w/o the album art) and rename the new to the original name
                      unlinkSync(fileName);
                      rename(tempFileName, fileName, () => ({}));
                      console.log('end in adding cover');
                    })
                    .addInput(resultObj.thumbnail)
                    .addOutputOption(["-map", '0:0'])
                    .addOutputOption(["-map", '1:0'])
                    .addOutputOption('-c', 'copy')
                    // has to save it in a different name otherwise, ffmpeg take only the first 2 seconds (weird behaviour)
                    .saveToFile(tempFileName);

                } else {
                  callback(null, resultObj);
                }
              });

              if (!(self.format in videoFormats)) {
                proc.withNoVideo()
              } else if (audioFormats[self.format]) {
                if (audioFormats[self.format].codec) {
                  proc.withAudioCodec(audioFormats[self.format].codec)
                }
                proc.toFormat(audioFormats[self.format].format || self.format)
              }

              proc.saveToFile(fileName);
          });
        } catch (error) {
          callback(error.message, task);
        }
  });
};

export default YoutubeMp3Downloader;

export type DownloadFilter = ytdl.downloadOptions['filter'];
export type DownloadQuality = 'lowest' | 'highest' | string | number;
export type DownloadFormat = 'mp3' | 'ogg' | 'wav' | 'flac' | 'm4a' | 'wma' | 'aac' | 'mp4' | 'mpg' | 'wmv';

export interface IYoutubeMp3DownloaderOptions {
  ffmpegPath?: string;
  outputPath: string;
  // https://github.com/fent/node-ytdl-core/blob/0574df33f3382f3a825e4bef30f21e51cd78eafe/typings/index.d.ts#L7
  youtubeVideoQuality?: DownloadQuality;
  queueParallelism: number;
  progressTimeout: number;
  filter?: DownloadFilter;
  format?: DownloadFormat;
}

export interface IResultObject {
  videoId: string;
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

declare class YoutubeMp3DownloaderClass extends EventEmitter.EventEmitter {
  setOutputPath: (path: string) => void;
  setQuality: (quality: DownloadQuality) => void;
  setFormat: (format: DownloadFormat) => void;
  cleanFileName: (fileName: string) => string;
  download: (videoId: string, fileName: string) => void;
  cancelDownload: (videoId: string) => void;
  abort: () => any;
  performDownload(task: any, callback: (err: any, result: any) => void): void;

  youtubeBaseUrl: string;
  youtubeVideoQuality: DownloadQuality;
  outputPath: string;
  queueParallelism: number;
  progressTimeout: number;
  fileNameReplacements: (string | RegExp)[][];
  requestOptions: any;
  outputOptions: string[];
  filter: DownloadFilter;
  format: DownloadFormat;
  stream: any;
  downloadQueue: async.AsyncQueue<IDownloadTask>;
}

interface IDownloadTask {
  videoId: string;
  fileName: string;
  abort?: Function;
  aborted?: boolean;
}