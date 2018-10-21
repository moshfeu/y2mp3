import * as React from 'react';
import { IVideoEntity } from '../types';

interface IVideoProps {
  video: IVideoEntity;
}

export class Video extends React.Component<IVideoProps, any> {
  render() {
    const { video } = this.props;
    console.log('video inside video', video);
    return (
      <div className='video'>
        <div>
          <img src={`https://img.youtube.com/vi/${video.id}/1.jpg`} />
        </div>
        <div>
          <progress value={video.progress} max={0}  /><br />
          Status: {video.status}
        </div>
      </div>
    )
  }
}