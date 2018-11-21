import * as React from 'react';
import { IVideoEntity, EVideoStatus } from '../types';
import { ButtonProgress } from './button-progress';

interface IVideoProps {
  video: IVideoEntity;
  onVideoStartClick: (video :IVideoEntity) => void;
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

  render() {
    const { video } = this.props;

    return (
      <div className="video" style={{backgroundImage: `url(https://img.youtube.com/vi/${video.id}/mqdefault.jpg)`}}>
        <div className="details">
          <div className="name">
            {video.name}
          </div>
          <div className="button">
            <ButtonProgress text="Download" onClick={() => console.warn('not yet implemented')} />
          </div>
        </div>
      </div>
    )
  }
}