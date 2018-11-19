import * as React from 'react';
import { IVideoEntity, EVideoStatus } from '../types';

interface IVideoProps {
  video: IVideoEntity;
  onVideoStartClick: (video :IVideoEntity) => void;
}

export class Video extends React.Component<IVideoProps, any> {
  constructor(props) {
    super(props);
  }

  buttonOrProgress() {
    const { video, onVideoStartClick } = this.props;

    if (video.status === EVideoStatus.NOT_STARTED) {
      return <button onClick={() => onVideoStartClick(video)}>Download "{video.name}"</button>
    } else {
      return (
        <div>
          <progress value={video.progress} max={100}  /><br />
          Status: {video.status}
        </div>
      )
    }
  }

  render() {
    const { video } = this.props;

    return (
      <div className="video" style={{backgroundImage: `url(https://img.youtube.com/vi/${video.id}/0.jpg)`}}>
        <div className="details">
          {video.name}
          {
            this.buttonOrProgress()
          }
        </div>
      </div>
    )
  }
}