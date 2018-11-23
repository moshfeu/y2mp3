import * as React from 'react';
import { installFfmpeg } from '../services/ffmpeg-installer';
import { ButtonProgress } from './button-progress';

interface IInstallFFMpegState {
  downloadProgress: number;
}

interface IInstallFFMpegProps {
  onDone: () => void;
}

export class InstallFFMpeg extends React.Component<IInstallFFMpegProps, IInstallFFMpegState> {
  constructor(props) {
    super(props);

    this.state = {
      downloadProgress: 0
    }
  }

  updateDownloadProgress = (data) => {
    this.setState({
      downloadProgress: data.progress
    }, () => {
      if (this.state.downloadProgress === 100) {
        setTimeout(() => {
          this.props.onDone();
        }, 2000);
      }
    });
  }

  download = () => {
    this.setState({
      downloadProgress: 1
    });
    installFfmpeg(this.updateDownloadProgress);
  }

  render() {
    const { downloadProgress } = this.state;

    return (
      <div className="install-ffmpeg">
        <div className="overlay"></div>
        <div className="message">
          <h2 className="disclamer">
            FFMpeg is not installed :(
          </h2>
          <p>
            FFMpeg helps us to convert the videos into mp3's.
          </p>
          <ButtonProgress
            text="download ⬇️"
            onClick={this.download}
            progress={downloadProgress}
          />
        </div>
      </div>
    );
  }
}