const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const ytlist = require('youtube-playlist');

function fetchVideos(playlistUrl: string, callback: (playlist: string[]) => void) {
  //Configure YoutubeMp3Downloader with your settings
  var YD = new YoutubeMp3Downloader({
      "ffmpegPath": "/Users/moshef/bin/JDownloader\ 2.0/tools/mac/ffmpeg_10.6+/ffmpeg",        // Where is the FFmpeg binary located?
      "outputPath": "./downloads",    // Where should the downloaded and encoded files be stored?
      "youtubeVideoQuality": "highest",       // What video quality should be used?
      "queueParallelism": 1,                  // How many parallel downloads/encodes should be started?
      "progressTimeout": 1000                 // How long should be the interval of the progress reports
  });

  ytlist(playlistUrl, 'id').then((data: any) => {
    console.log('fetch videos from platlist', data);
    const { data: {playlist} } = data;
    callback(playlist);
    playlist.forEach((videoId: string) => {
      YD.download(videoId);
    });
  });

  //Download video and save as MP3 file
  // YD.download("JvKKd32Yw2E");

  YD.on("finished", function() {
      // console.log(JSON.stringify(data, null, 2));
      console.log('done');
  });

  YD.on("error", function(error: string) {
      console.log(error);
  });


  YD.on("progress", function(progress: any) {
    console.log(JSON.stringify(progress, null, 2));
  });

  YD.on("queueSize", function(size: string) {
    console.log('size', size);
  });
}