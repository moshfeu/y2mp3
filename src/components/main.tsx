import '../styles/style.scss';

import * as React from 'react';
import * as DOM from 'react-dom';
import { fetchVideos, downloader } from '../services/api';
import { IVideoEntity, EVideoStatus } from '../types';
import { Video } from './video';
import { IVideoTask } from 'youtube-mp3-downloader';
import { installFfmpeg, isFFMpegInstalled } from '../services/ffmpeg-installer';
import { Form } from './form';
import { ButtonProgress } from './button-progress';

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

    this.setState({
      videos: [
        {
          "id": "JvKKd32Yw2E",
          "name": "video 1",
          "progress": 0,
          "status": EVideoStatus.NOT_STARTED
        },
        {
          "id": "tPEE9ZwTmy0",
          "name": "video 2",
          "progress": 0,
          "status": EVideoStatus.NOT_STARTED
        },
        {
          "id": "cdwal5Kw3Fc",
          "name": "video 3",
          "progress": 0,
          "status": EVideoStatus.NOT_STARTED
        }
      ]
    })
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
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.PENDING;
    videos[videoIndex].progress = 2;
    console.log(videos, 'addToQueue');
    this.setState({videos});
  }

  private gettingInfo = (videoId: string) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.GETTING_INFO;
    videos[videoIndex].progress = 20;
    console.log(videos, 'gettingInfo');
    this.setState({videos});
  }

  private progress = ({videoId, progress}: IVideoTask) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.DOWNLOADING;
    videos[videoIndex].progress = 20 + (progress.percentage * 0.8);
    console.log(videos, 'progress');
    this.setState({videos});
  }

  private finished = (err, data) => {
    const { videos } = this.state;
    const  { videoId } = data;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.DONE;
    videos[videoIndex].progress = 0;
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
    const { videos, downloadProgress } = this.state;
    return (
      <div className="main">
        <div className={isFFMpegInstalled() ? '' : 'hidden'}>
          <Form
            hasResult={!!videos.length}
            onSubmit={this.fetchVideosClick}
            onClear={() => this.setState({videos: []})}
          >
            {videos.length &&
              <ButtonProgress text="Download All" onClick={this.downloadAll} />
            }
            <div className="videos">
              {videos.map(video => (
                <Video key={video.id} video={video} onVideoDownloadClick={this.downloadVideo} />
              ))}
            </div>
          </Form>
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