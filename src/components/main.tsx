import '../styles/style.scss';

import * as React from 'react';
import * as DOM from 'react-dom';
import { fetchVideos, downloader } from '../services/api';
import { IVideoEntity, EVideoStatus } from '../types';
import { Video } from './video';
import { IVideoTask } from 'youtube-mp3-downloader';
import { isFFMpegInstalled } from '../services/ffmpeg-installer';
import { Form } from './form';
import { ButtonProgress } from './button-progress';
import { InstallFFMpeg } from './install-ffmpeg';

interface IMainState {
  videos: IVideoEntity[];
  inProcess: boolean;
  doneDownloading: boolean;
  isFFMpegInstalled: boolean;
}

class Main extends React.Component<{}, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      videos: [],
      inProcess: false,
      doneDownloading: false,
      isFFMpegInstalled: isFFMpegInstalled()
    };
  }

  componentDidMount() {
    this.listenToDownloader();

    // this.setState({
    //   videos: [
    //     {
    //       "id": "JvKKd32Yw2E",
    //       "name": "video 1",
    //       "progress": 0,
    //       "status": EVideoStatus.NOT_STARTED
    //     },
    //     {
    //       "id": "tPEE9ZwTmy0",
    //       "name": "video 2",
    //       "progress": 0,
    //       "status": EVideoStatus.NOT_STARTED
    //     },
    //     {
    //       "id": "cdwal5Kw3Fc",
    //       "name": "video 3",
    //       "progress": 0,
    //       "status": EVideoStatus.NOT_STARTED
    //     }
    //   ]
    // })
  }

  fetchVideosClick = async (terms: string) => {
    this.setState({inProcess: true});
    const videos = await fetchVideos(terms);
    this.setState({videos, inProcess: false});
  }
  videoIndex = (videoId:  string) => {
    return this.state.videos.findIndex(v => v.id === videoId);
  }

  addToQueue = (videoId: string) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.PENDING;
    videos[videoIndex].progress = 0;
    console.log(videos, 'addToQueue');
    this.setState({videos});
  }

  countProgressUntil(videoIndex: number, until: number): void {
    const { videos } = this.state;
    const video = videos[videoIndex];
    const makeProgress = () => {
      const {progress, status} = video;
      if (progress === until || status !== EVideoStatus.GETTING_INFO) {
        return;
      }
      video.progress = Math.min(progress + (1 + Math.floor(Math.random() * 4)), until);
      this.setState({
        videos
      })
      setTimeout(() => {
        makeProgress()
      }, Math.random()*500);
    }
    makeProgress();
  }

  gettingInfo = (videoId: string) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.GETTING_INFO;
    this.countProgressUntil(videoIndex, 19);
    console.log(videos, 'gettingInfo');
    this.setState({videos});
  }

  progress = ({videoId, progress}: IVideoTask) => {
    const { videos } = this.state;
    const videoIndex = this.videoIndex(videoId);
    videos[videoIndex].status = EVideoStatus.DOWNLOADING;
    videos[videoIndex].progress = 20 + Math.floor(progress.percentage * 0.8);
    console.log(videos, 'progress');
    this.setState({videos});
  }

  finished = (err, data) => {
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

  error = (err, data) => {
    alert(err);
  }

  listenToDownloader() {
    return downloader
      .on('addToQueue', this.addToQueue)
      .on('gettingInfo', this.gettingInfo)
      .on('progress', this.progress)
      .on('finished', this.finished)
      .on('error', this.error);
  }

  downloadVideo = async (video: IVideoEntity) => {
    downloader.download(video.id);
  }

  downloadAll = () => {
    this.state.videos.forEach(video => {
      this.downloadVideo(video);
    });
  }

  public render() {
    const { videos, inProcess, isFFMpegInstalled } = this.state;
    return (
      <div className="main">
        <Form
          hasResult={!!videos.length}
          onSubmit={this.fetchVideosClick}
          onClear={() => this.setState({videos: []})}
          inProcess={inProcess}
        >
          {videos.length ?
            <div>
              <ButtonProgress text="Download All" onClick={this.downloadAll} />
              <div className="videos">
                {videos.map((video, i) => (
                  <Video
                    key={video.id}
                    video={video}
                    onVideoDownloadClick={this.downloadVideo}
                    style={{
                      animationDelay: `${(i + 1) * 200}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          : ''}
        </Form>
        {
          !isFFMpegInstalled && <InstallFFMpeg onDone={() => this.setState({isFFMpegInstalled: true})} />
        }
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);