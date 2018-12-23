import '../styles/style.scss';

import * as React from 'react';
import * as DOM from 'react-dom';
import { observer } from 'mobx-react';
import { downloader, download } from '../services/api';
import store from '../mobx/store';
import { IVideoEntity } from '../types';
import { Video } from './video';
import { Form } from './form';
import { ButtonProgress } from './button-progress';
import { InstallFFMpeg } from './install-ffmpeg';
import { ipcRenderer } from '../services/electron-adapter';
import { AboutModal } from './about-modal';
import { PreferencesModal } from './preferences-modal/preferences-modal';

interface IMainState {
  doneDownloading: boolean;
  isAboutOpen: boolean;
  isPreferencesOpen: boolean;
}

@observer
class Main extends React.Component<{}, IMainState> {

  constructor(props: any) {
    super(props);

    this.state = {
      doneDownloading: false,
      isAboutOpen: false,
      isPreferencesOpen: false,
    };
  }

  componentDidMount() {
    ipcRenderer.on('open-about', () => this.setState({
      isAboutOpen: true
    }));

    ipcRenderer.on('open-preferences', () => this.setState({
      isPreferencesOpen: true
    }));
  }

  downloadVideo = async (video: IVideoEntity) => {
    download(video.id)
  }

  downloadAll = () => {
    download(store.videos.map(videos => videos.id));
  }

  public render() {
    const { searchInProgress, videos } = store;
    return (
      <div className="main">
        <Form
          hasResult={!!videos.length}
          onSubmit={store.search}
          onClear={() => store.clearResult()}
          inProcess={searchInProgress}
        >
          {videos.length ?
            <div>
              <ButtonProgress text="Download All" onClick={this.downloadAll} />
              <div className="videos">
                {videos.map((video, i) => (
                  <Video
                    key={video.id}
                    video={video}
                    onVideoDownloadClick={this.downloadVideo}
                    style={{
                      animationDelay: `${(i + 1) * 200}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          : ''}
        </Form>
        {
          !store.isFFMpegInstalled && <InstallFFMpeg onDone={() => store.isFFMpegInstalled = true} />
        }
        <AboutModal open={this.state.isAboutOpen} onClose={() => this.setState({isAboutOpen: false})} />
        <PreferencesModal open={this.state.isPreferencesOpen} onClose={() => this.setState({isPreferencesOpen: false})} />
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(<Main />, root);