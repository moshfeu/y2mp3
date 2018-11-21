import * as React from 'react';
import { IVideoEntity, EVideoStatus } from '../types';
import { ButtonProgress } from './button-progress';

interface IVideoProps {
  video: IVideoEntity;
  onVideoDownloadClick: (video :IVideoEntity) => void;
}

export class Video extends React.Component<IVideoProps, any> {
  constructor(props) {
    super(props);
  }

  // buttonOrProgress() {
  //   const { video, onVideoStartClick } = this.props;

  //   if (video.status === EVideoStatus.NOT_STARTED) {
  //     return <button onClick={() => onVideoStartClick(video)}>Download "{video.name}"</button>
  //   } else {
  //     return (
  //       <div>
  //         <progress value={video.progress} max={100}  /><br />
  //         Status: {video.status}
  //       </div>
  //     )
  //   }
  // }

  get backgroundImage(): string {
    return `url(https://img.youtube.com/vi/${this.props.video.id}/mqdefault.jpg)`;
  }

  render() {
    const { video, onVideoDownloadClick } = this.props;
    const { backgroundImage } = this;

    return (
      <div className="video" style={{backgroundImage}}>
        <div className="details">
          <div className="name">
            {video.name}
          </div>
          <div className="button">
            <ButtonProgress
              text="Download"
              progress={video.progress}
              onClick={() => onVideoDownloadClick(video)}
            />
          </div>
        </div>
      </div>
    )
  }
}