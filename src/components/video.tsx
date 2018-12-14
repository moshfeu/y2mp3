import * as React from 'react';
import { IVideoEntity, EVideoStatus } from '../types';
import { ButtonProgress } from './button-progress';

interface IVideoProps {
  style?: React.CSSProperties,
  video: IVideoEntity;
  onVideoDownloadClick: (video :IVideoEntity) => void;
}

export class Video extends React.Component<IVideoProps, any> {
  constructor(props) {
    super(props);
  }

  get backgroundImage(): string {
    return `url(https://img.youtube.com/vi/${this.props.video.id}/mqdefault.jpg)`;
  }

  render() {
    const { video, onVideoDownloadClick, style } = this.props;
    const { backgroundImage } = this;
    const text = video.status === EVideoStatus.PENDING ? 'Waiting' : 'Download';
    const isDisabled = video.status !== EVideoStatus.NOT_STARTED && video.status !== EVideoStatus.DONE;

    return (
      <div className="video" style={{backgroundImage, ...style}}>
        <div className="details">
          <div className="name">
            {video.name}
          </div>
          <div className="button">
            <ButtonProgress
              text={text}
              progress={video.progress}
              onClick={() => onVideoDownloadClick(video)}
              disabled={isDisabled}
            />
          </div>
        </div>
      </div>
    )
  }
}