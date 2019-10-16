import * as React from 'react';
import { installFfmpeg } from '../services/ffmpeg-installer';
import { ButtonProgress } from './button-progress';
import { setFfmpegPath } from '../services/api';
import { Progress } from 'ffbinaries';

interface IInstallFFMpegState {
  downloadProgress: number;
}

interface IInstallFFMpegProps {
  onDone: () => void;
  onError: (error: string) => void;
}

export class InstallFFMpeg extends React.Component<IInstallFFMpegProps, IInstallFFMpegState> {
  constructor(props) {
    super(props);

    this.state = {
      downloadProgress: 0
    }
  }

  updateDownloadProgress = (data: Progress) => {
    this.setState({
      downloadProgress: Math.max(1, Math.floor(data.progress * 100))
    });
  }

  download = async () => {
    try {
      this.setState({
        downloadProgress: 1
      });
      await installFfmpeg(this.updateDownloadProgress);
      setFfmpegPath();
      setTimeout(() => {
        this.props.onDone();
      }, 2000);
    } catch (error) {
      this.props.onError(error);
      this.setState({
        downloadProgress: 0
      });
    }
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