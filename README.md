[![Travis-ci build Status](https://travis-ci.com/moshfeu/y2mp3.svg?branch=master)](https://travis-ci.com/moshfeu/y2mp3)
[![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-green.svg)](https://wallabyjs.com)
[![Release version](https://img.shields.io/github/release/moshfeu/y2mp3.svg)](https://github.com/moshfeu/y2mp3/releases/latest)
[![Github All Releases](https://img.shields.io/github/downloads/moshfeu/y2mp3/total.svg)](https://github.com/moshfeu/y2mp3/releases)

<img src="app-resources/logo-128.png" alt="logo" />

## What is "Y2Mp3" app?

A simple desktop application to download Youtube videos to video (mp4, mpg, wmv) and audio (wav, flac, m4a, wma, mp3, ogg, acc) formats, one by one or all of them.

<img src="app-resources/video.gif" alt="video demo" width="320" />

#### Find us on Slack

<a href="https://join.slack.com/t/y2mp3/shared_invite/enQtNTk0OTE0Njc4ODY4LTYzYmY1M2MwMWFmZmQ1NTA2MDMxNWIzZTFkYzcyOTdkMjE3ZmNmMzk4NmM4YWY5OThkYTJjNzFhZTA0NGI3OTk" target="_blank"><img src="https://cdn.brandfolder.io/5H442O3W/as/pl546j-7le8zk-ex8w65/Slack_RGB.png?width=120" alt="link to Slack channel" /></a>

## Disclaimer
📢📢
1. The app doesn't track you down in ANY way. Not Google Analytics, or any other service. We know nothing jon snow! So, if you have an idea about how to make this app even greater, we will not know unless you will tell us. Please fill a [Feature Request](https://github.com/moshfeu/y2mp3/issues/new?assignees=moshfeu&labels=enhancement&template=feature_request.md) or [Open a bug](https://github.com/moshfeu/y2mp3/issues/new?assignees=moshfeu&labels=bug&template=bug_report.md) and let we know what do you think.
2. The app doesn't store ANY media files ANYWHERE except on the device who use this app.
3. Please use this app for downloading only public resources (You shouldn't be able to download private media). If you doesn't see all of the videos in the playlist, probably, they private (even it's yours private)

⚖ 🕵


## Supported operating systems

<img width="30" alt="windows" src="app-resources/readme/windows.svg?sanitize=true" />
<img width="30" alt="mac" src="app-resources/readme/mac.svg?sanitize=true" />
<img width="30" alt="linux" src="app-resources/readme/linux.svg?sanitize=true" />

## Download

- Free 💰
- No ads 📣

Find your download: [https://github.com/moshfeu/y2mp3/releases/latest](https://github.com/moshfeu/y2mp3/releases/latest)

## Change log

##### 2.5.0

Fix - The app didn't work at all because if changes in Youtube.

##### 2.4.1

Fix - some downloads failed ("The video is unavailable")

##### 2.4.0

- Allow to stop active video download
- Scroll the screen to a download when it starts

##### 2.3.0

- Allow to remove videos from the list

<img width="82" alt="Remove from the list (feature screenshot)" src="https://user-images.githubusercontent.com/3723951/66964159-7a4e2d00-f07e-11e9-8a78-1fc971b92183.png">


- Icon in the tray that shows the progress

<img width="267" alt="progress (feature screenshot)" src="https://user-images.githubusercontent.com/3723951/66964583-bdf56680-f07f-11e9-8a9e-1fd7e6394175.jpg" />

- Show notification when video downloaded

<img width="357" alt="notification (feature screenshot)" src="https://user-images.githubusercontent.com/3723951/66964794-50960580-f080-11e9-97bd-9d7382ea2470.png">

- Bug fixes

##### 2.2.0

- Attach the video's thumbnail as album art

<img width="265" alt="Album art (feature screenshot)" src="https://user-images.githubusercontent.com/3723951/66707744-4ad1b480-ed4e-11e9-927f-a92c940ee574.png">

- Add menu for better accesibility to useful options

<img width="296" alt="New Menu (feature screenshot)" src="https://user-images.githubusercontent.com/3723951/66707712-dc8cf200-ed4d-11e9-889d-8b36cca17772.png">

##### 2.1.0

- Check for updates automatically (Thanks (again) to [@iahmedhendi](https://github.com/iahmedhendi))

<img width="288" alt="Screen Shot" src="https://user-images.githubusercontent.com/3723951/66351800-f356d180-e966-11e9-8ede-a3bbfad9a2b0.png">

##### 2.0.0

- Allow to download videos! (supported formats: mp4, wmv, mpg)
- Bug fixes and UI improvements

##### 1.7.0

- Don't open multiple folder picker dialogs (Thanks to [@iahmedhendi](https://github.com/iahmedhendi) for the issue)
- Don't ask to install ffmpeg if it already installed (Thanks to [@antwake](https://github.com/antwake) for the issue)

##### 1.6.0 (Thanks to [softpedia](https://www.softpedia.com/get/Internet/Download-Managers/y2mp3.shtml) for the ideas)
- Allow to choose different audio formats (mp3, wav, flac, m4a, wma, ogg, aac)
- Copied URLs will be automatically be loaded into the app.

##### 1.5.0
Add the option to save each playlist to a dedicated folder - thanks to [@saydax](https://github.com/saydax) for the request

##### 1.4.0
Make song title a link - thanks to [@shayanypn](https://github.com/shayanypn)

##### 1.3.0
- Allow to change the audio quality
- display a proper message when the url is not supported or invalid

##### 1.2.0
Allow to change the downloads folder

##### 1.1.0
Allow fetch and download a single video

##### 1.0.0
Fetch videos from youtube playlist and download them one by one or all.

## Contributors

- [@shayanypn](https://github.com/shayanypn)


<div>
  Os Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
</div>

## Development

    npm install
    npm start

Or

    yarn
    yarn start

### Stack

<table>
  <tr>
    <td><a href="http://electronjs.org/"><img width="25" alt="electron" src="https://github.githubassets.com/images/icons/emoji/electron.png" /></a></td>
    <td><a href="https://reactjs.org/"><img width="45" alt="reactjs" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" /></a></td>
    <td><a href="https://mobx.js.org/"><img width="25" alt="mobx" src="https://mobx.js.org/docs/mobx.png" /></a></td>
    <td><a href="https://www.typescriptlang.org/"><img width="25" alt="typescript" src="https://github.com/remojansen/logo.ts/blob/master/ts.jpg?raw=true" /></a></td>
    <td><a href="https://webpack.js.org/"><img width="30" src="https://github.com/webpack/media/blob/master/logo/icon-square-small.jpg?raw=true" /></a></td>
  <tr>
    <td><a target="_blank" href="http://electronjs.org/">electron</a></td>
    <td><a target="_blank" href="https://reactjs.org/">reactjs</a></td>
    <td><a target="_blank" href="https://mobx.js.org/">mobx</a></td>
    <td><a target="_blank" href="https://www.typescriptlang.org/">typescript</a></td>
    <td><a target="_blank" href="https://webpack.js.org/">webpack</a></td>
  </tr>
</table>

**Logos licenes**
- Facebook [Public domain or CC BY-SA 1.0 (https://creativecommons.org/licenses/by-sa/1.0)]

#### Tests

- [jest](https://jestjs.io/)

#### Libraries

- [youtube-mp3-downloader](https://github.com/ytb2mp3/youtube-mp3-downloader)
- [youtube-playlist](https://github.com/CodeDotJS/youtube-playlist)
- [ffbinaries](https://github.com/vot/ffbinaries-node)
- [Semantic UI React](https://react.semantic-ui.com/)

### TODO

🖖🎖 Thanks you for your willing to contribute! You can find the list in the [project](https://github.com/moshfeu/y2mp3/projects/1#column-3954836) page.

## License
MIT
