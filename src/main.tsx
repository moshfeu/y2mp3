import * as React from 'react';
import * as DOM from 'react-dom';
import {fetchVideos} from './api';

interface IMainState {
  playlistUrl: string;
  videos: string[];
}

class Main extends React.Component<any, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      videos: [],
      playlistUrl: 'https://www.youtube.com/playlist?list=PLtKALR6MChBz1gYizYPwjggc5BGAmYRRK'
    };
  }

  private fetchVideosClick = (): void => {
    fetchVideos(this.state.playlistUrl)
      .then(videos => {
        console.log('!!!Videos', videos);
        this.setState({videos})
      })
  }

  public render() {
    const { playlistUrl, videos } = this.state;
    console.log(videos);
    return (
      <div>
        <input type="url" id="playlistUrl" placeholder="playlist url" value={playlistUrl} onChange={e => this.setState({playlistUrl: e.target.value})} />
        <button onClick={this.fetchVideosClick}>Fetch</button>
        <hr />
        <ul>
        {videos.map(video => {
          return <li>{video}</li>
        })}
        </ul>
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);