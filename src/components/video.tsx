import * as React from 'react';
import { IVideoEntity } from '../types';

interface IVideoProps {
  video: IVideoEntity;
}

export class Video extends React.Component<IVideoProps, any> {
  render() {
    const { video } = this.props;
    return (
      <div className='video'>
        <img src={`https://img.youtube.com/vi/${video.id}/1.jpg`} />
        <progress value={video.progress} max={0}  />
      </div>
    )
  }
}