import '../styles/style.scss';

import * as React from 'react';
import * as DOM from 'react-dom';
import store from '../mobx/store';
import { observer } from 'mobx-react';
import { download } from '../services/api';
import { IVideoEntity } from '../types';
import { Video } from './video';
import { Form } from './form';
import { ButtonProgress } from './button-progress';
import { InstallFFMpeg } from './install-ffmpeg';
import { AboutModal } from './about-modal';
import { PreferencesModal } from './preferences-modal/preferences-modal';
import { ElectronEventsListener } from './electron-events-listener';

@observer
class Main extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props);
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
        <AboutModal open={store.isAboutOpen} onClose={() => store.isAboutOpen = false} />
        <PreferencesModal open={store.isPreferencesOpen} onClose={() => store.isPreferencesOpen = false} />
      </div>
    );
  }
}

const root = document.getElementById('app');
DOM.render(
  <ElectronEventsListener>
    <Main />
  </ElectronEventsListener>
, root);