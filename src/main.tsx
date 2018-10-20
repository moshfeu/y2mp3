import * as React from 'react';
import * as DOM from 'react-dom';
import {fetchVideos} from './api';
import {IVideoEntity, IDownloadProgress} from './types';
import { Video } from './components/video';

interface IMainState {
  playlistUrl: string;
  videos: IVideoEntity[];
  process: boolean;
}

class Main extends React.Component<any, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      process: false,
      videos: [],
      playlistUrl: 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK'
    };
  }

  private onVideosFetched = (videos: IVideoEntity[]) => {
    this.setState({videos});
  }

  private onVideoProgress = (videoIndex: number, progress: IDownloadProgress) => {
    const { videos } = this.state;
    videos[videoIndex].progress = progress.percentage;
    console.log(progress);
    this.setState({videos});
  }

  private fetchVideosClick = (): void => {
    this.setState({process: true});
    fetchVideos(this.state.playlistUrl, this.onVideosFetched, this.onVideoProgress);
  }

  public render() {
    const { playlistUrl, videos, process } = this.state;

    return (
      <div>
        <input type="url" id="playlistUrl" placeholder="playlist url" value={playlistUrl} onChange={e => this.setState({playlistUrl: e.target.value})} />
        <button onClick={this.fetchVideosClick} disabled={process}>Fetch</button>
        <hr />
        <div>
        {videos.map(video => (
          <Video video={video} />
        ))}
        </div>
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);