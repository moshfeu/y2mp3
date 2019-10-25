import * as React from 'react';
import { observe } from 'mobx';
import { observer } from 'mobx-react';
import { IVideoEntity, EVideoStatus, IButtonProgressOptions } from '../types';
import { ButtonProgress } from './button-progress';
import { shell } from '../services/electron-adapter';
import { formatOptions } from './preferences-modal/lists';
import { settingsManager } from '../services/settings';
import { DownloadFormat } from '../services/youtube-mp3-downloader';
import { Popup, Button } from 'semantic-ui-react';
import { removeVideo } from '../services/api';

const options: IButtonProgressOptions[] = formatOptions.map(option => {
  return {
    content: option.text,
    header: option.disabled
  }
});

interface IVideoProps {
  style?: React.CSSProperties,
  video: IVideoEntity;
  onVideoDownloadClick: (video :IVideoEntity) => void;
}

@observer
export class Video extends React.Component<IVideoProps, any> {
  containerNode: HTMLDivElement;

  constructor(props) {
    super(props);
  }

  get backgroundImage(): string {
    return `url(https://img.youtube.com/vi/${this.props.video.id}/mqdefault.jpg)`;
  }

  onClickTitle = () =>  {
    shell.openExternal(`https://www.youtube.com/watch?v=${this.props.video.id}`);
  }

  onFormatClicked = (e: any, data: { value: DownloadFormat }) => {
    const { value: format } = data;
    settingsManager.downloadFormat = format;
  }

  componentDidMount() {
    observe(this.props.video, 'status', status => {
      if (status.newValue === EVideoStatus.GETTING_INFO) {
        this.containerNode.scrollIntoView({behavior: 'smooth'});
      }
    });
  }

  componentWillUnmount() {
    const {id, status} = this.props.video;
    if (status === EVideoStatus.NOT_STARTED || status === EVideoStatus.DONE) {
      return;
    }
    console.log('componentWillUnmount', id);
    removeVideo(id);
  }

  render() {
    const { video, onVideoDownloadClick, style } = this.props;
    const { backgroundImage } = this;
    const text = video.status === EVideoStatus.PENDING ? 'Waiting' : 'Download';
    const isDisabled = video.status !== EVideoStatus.NOT_STARTED && video.status !== EVideoStatus.DONE;
    const { downloadFormat } = settingsManager;

    return (
      <div className="video" ref={elm => this.containerNode = elm} style={{backgroundImage, ...style}}>
        <Popup
          trigger={
            <Button className="remove" color="red" circular basic icon="close" onClick={() => removeVideo(video.id)}></Button>
          }
          content="Remove"
          inverted
        />
        <div className="details">
          <Popup
            trigger={<div className="name"
              onClick={this.onClickTitle}>
              {video.name}
            </div>}
            content={video.name}
            inverted
          />
          <div className="button">
            <ButtonProgress
              text={text}
              progress={video.progress}
              onClick={() => onVideoDownloadClick(video)}
              disabled={isDisabled}
              options={options}
              isItemActive={option => option === downloadFormat}
              onItemClick={this.onFormatClicked} />
          </div>
        </div>
      </div>
    )
  }
}