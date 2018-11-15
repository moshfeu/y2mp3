import '../styles/style.scss';

import * as React from 'react';
import * as DOM from 'react-dom';
import { fetchVideos, downloader } from '../services/api';
import { IVideoEntity, EVideoStatus } from '../types';
import { Video } from './video';
import { IVideoTask } from 'youtube-mp3-downloader';
import { installFfmpeg, isFFMpegInstalled } from '../services/ffmpeg-installer';

interface IMainState {
  playlistUrl: string;
  videos: IVideoEntity[];
  process: boolean;
  doneDownloading: boolean;
  downloadProgress: string;
}

class Main extends React.Component<any, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      videos: [],
      process: false,
      doneDownloading: false,
      playlistUrl: 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK',
      downloadProgress: ''
    };
  }

  componentDidMount() {
    this.listenToDownloader();
  }

  private fetchVideosClick = async () => {
    this.setState({process: true});
    const videos = await fetchVideos(this.state.playlistUrl);
    this.setState({videos, process: false});
  }
  private videoIndex = (videoId:  string) => {
    return this.state.videos.findIndex(v => v.id === videoId);
  }

  private addToQueue = (videoId: string) => {
    const { videos } = this.state;
    videos[this.videoIndex(videoId)].status = EVideoStatus.PENDING;
    console.log(videos, 'addToQueue');
    this.setState({videos});
  }

  private gettingInfo = (videoId: string) => {
    const { videos } = this.state;
    videos[this.videoIndex(videoId)].status = EVideoStatus.GETTING_INFO;
    console.log(videos, 'gettingInfo');
    this.setState({videos});
  }

  private progress = ({videoId, progress}: IVideoTask) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.DOWNLOADING;
    videos[videoIndex].progress = progress.percentage;
    console.log(videos, 'progress');
    this.setState({videos});
  }

  private finished = (err, data) => {
    const { videos } = this.state;
    const  { videoId } = data;
    videos[this.videoIndex(videoId)].status = EVideoStatus.DONE;
    this.setState({videos});
    console.log('done');

    if (err) {
      alert(err);
    }
  }

  private error = (err, data) => {
    alert(err);
  }

  private listenToDownloader() {
    return downloader
      .on('addToQueue', this.addToQueue)
      .on('gettingInfo', this.gettingInfo)
      .on('progress', this.progress)
      .on('finished', this.finished)
      .on('error', this.error);
  }

  private downloadVideo = async (video: IVideoEntity) => {
    downloader.download(video.id);
  }

  downloadAll = () => {
    this.state.videos.forEach(video => {
      this.downloadVideo(video);
    });
  }

  private updateDownloadProgress = (data) => {
    this.setState({downloadProgress: (data.progress*100).toFixed(1) + '%'})
  }

  public render() {
    const { playlistUrl, videos, process, downloadProgress } = this.state;
    return (
      <div>
        <div className={isFFMpegInstalled() ? '' : 'hidden'}>
          <input type="url" id="playlistUrl" placeholder="playlist url" value={playlistUrl} onChange={e => this.setState({playlistUrl: e.target.value})} />
          <button onClick={this.fetchVideosClick} disabled={process}>Fetch</button>
          <hr />
          <div>
          {videos.length ?
            <button onClick={this.downloadAll}>Download All</button> : ''
          }
          {videos.map(video => (
            <Video key={video.id} video={video} onVideoStartClick={this.downloadVideo} />
          ))}
          </div>
        </div>
        <div className={isFFMpegInstalled() ? 'hidden' : ''}>
            ffMpeg is not install :(<br />
            <button onClick={() => installFfmpeg(this.updateDownloadProgress)}>Install it</button><br />
            downloadProgress: {downloadProgress}
        </div>
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);