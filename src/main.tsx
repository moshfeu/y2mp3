import * as React from 'react';
import * as DOM from 'react-dom';
import { fetchVideos, getDownloader } from './api';
import { IVideoEntity, EVideoStatus } from './types';
import { Video } from './components/video';
import { IVideoTask } from 'youtube-mp3-downloader';

interface IMainState {
  playlistUrl: string;
  videos: IVideoEntity[];
  process: boolean;
  doneDownloading: boolean;
}

class Main extends React.Component<any, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      videos: [],
      process: false,
      doneDownloading: false,
      playlistUrl: 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK'
    };
  }

  private fetchVideosClick = async () => {
    this.setState({process: true});
    const videos = await fetchVideos(this.state.playlistUrl);
    this.setState({videos});
  }

  private downloadVideo = async (video: IVideoEntity) => {
    const { videos } = this.state;
    const videoIndex = (videoId:  string) => videos.findIndex(v => v.id === videoId);
    const downloader = await getDownloader(video);
    downloader
      .on('addToQueue', (videoId: string) => {
        videos[videoIndex(videoId)].status = EVideoStatus.PENDING;
        console.log(videos, 'addToQueue');
        this.setState({videos});
      })
      .on('gettingInfo', (videoId: string) => {
        videos[videoIndex(videoId)].status = EVideoStatus.GETTING_INFO;
        console.log(videos, 'gettingInfo');
        this.setState({videos});
      })
      .on('progress', ({videoId, progress}: IVideoTask) => {
        videos[videoIndex(videoId)].status = EVideoStatus.DOWNLOADING;
        videos[videoIndex(videoId)].progress = progress.percentage;
        console.log(videos, 'progress');
        this.setState({videos});
      })
      .on('finished', (err, data) => {
        const  { videoId } = data;
        videos[videoIndex(videoId)].status = EVideoStatus.DONE;
        this.setState({videos});
      });
      downloader.download(video.id);;
  }

  downloadAll = () => {
    console.log('this', this);
    this.state.videos.forEach(video => {
      this.downloadVideo(video);
    });
  }

  public render() {
    const { playlistUrl, videos, process } = this.state;
    return (
      <div>
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
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);