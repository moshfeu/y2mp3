[![Travis-ci build Status](https://travis-ci.com/moshfeu/y2mp3.svg?branch=master)](https://travis-ci.com/moshfeu/y2mp3)
[![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-green.svg)](https://wallabyjs.com)
[![Release version](https://img.shields.io/github/release/moshfeu/y2mp3.svg)](https://github.com/moshfeu/y2mp3/releases/latest)
[![Github All Releases](https://img.shields.io/github/downloads/moshfeu/y2mp3/total.svg)](https://github.com/moshfeu/y2mp3/releases)
[![Follow me on Twitter](https://img.shields.io/twitter/follow/y2mp3.svg?style=social)](https://twitter.com/y2mp3)

<img src="app-resources/logo-128.png" alt="logo" />

## What is "Y2Mp3" app?

A simple desktop application to download Youtube videos to video (mp4, mpg, wmv) and audio (wav, flac, m4a, wma, mp3, ogg, acc) formats, one by one or all of them.

A note: Since this app relays on youtube site and apis, it sometimes breaks without any change.
In this case, please create an issue or tweet [@y2mp3](https://twitter.com/y2mp3)

<img src="app-resources/video.gif" alt="video demo" width="320" />

#### Limitations

- Fetch only first 100 clips in a playlist

## Disclaimers
📢📢

1. Privacy Disclaimer: Like Jon Snow, we know nothing about you! We value your privacy and do not track any of your data or activities through the Y2Mp3 app (No Google Analytics or any other tool). We appreciate your feedback and suggestions to improve our app, so feel free to share your thoughts through our Feature Request or Bug Report sections.
2. Media Storage Disclaimer: We do not store any media files downloaded through the Y2Mp3 app anywhere except on your device. Your downloaded files are your property, and we do not have access to them.
3. Usage Guidelines Disclaimer: We advise you to only use Y2Mp3 for downloading public resources, as it is not intended for downloading private media. If you cannot download all of the videos in a playlist, it is likely that some of them are private, including any private videos that you own.

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

##### 2.6.0

Unlocking downloading from Europe and other locations requires accepting YouTube's terms of service

##### 2.5.0

Fix - The app didn't work at all because of changes in Youtube.

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

## CI / CD

This project uses github actions to build and release the app. The action runs on every push master and PR and every tag push.

### Release

To release a new version, just push a new tag. The tag should be in the format `vX.Y.Z` (e.g. `v1.2.3`). The action will create a new release with the tag name and the binaries for all platforms as Draft.

Once you happy with the release, just publish it.

### Stack

<table>
  <tr>
    <td><a href="http://electronjs.org/"><img width="25" alt="electron" src="https://github.githubassets.com/images/icons/emoji/electron.png" /></a></td>
    <td><a href="https://reactjs.org/"><img width="45" alt="reactjs" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" /></a></td>
    <td><a href="https://mobx.js.org/"><img width="25" alt="mobx" src="https://mobx.js.org/img/mobx.png" /></a></td>
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
