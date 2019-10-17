import ytdl = require('ytdl-core');

const fileNameReplacemant = [[/"/g, ""], [/'/g, ""], [/\//g, ""], [/\?/g, ""], [/:/g, ""], [/;/g, ""]];

export function cleanFileName(fileName: string) {
  fileNameReplacemant.forEach((replacement: string[]) => {
    fileName = fileName.replace(replacement[0], replacement[1]);
  });

  return fileName;
}

export function getVideoMetaData(videoTitle: string, info: ytdl.videoInfo) {
  let artist = 'Unknown';
  let title = 'Unknown';
  if (videoTitle.indexOf('-') > -1) {
    const temp = videoTitle.split('-');
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

  return { artist, title, thumbnail: `https://img.youtube.com/vi/${info.video_id}/mqdefault.jpg` };
}

export const youtubeBaseUrl = 'http://www.youtube.com/watch?v=';