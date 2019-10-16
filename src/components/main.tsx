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
import { closeModal, showCustomError } from '../services/modalsAndAlerts';
import { Message } from 'semantic-ui-react';
import * as classNames from 'classnames';
import { settingsManager } from '../services/settings';
import { checkForUpdateAndNotify } from '../services/check-for-update';
import AppMenu from './menu';

@observer
class Main extends React.Component<{}, {}> {

  constructor(props: any) {
    super(props);
  }

  downloadVideo = async (video: IVideoEntity) => {
    download(video);
  }

  downloadAll = () => {
    download(store.videos);
  }

  async componentDidMount() {
    const { checkForUpdate } = settingsManager;
    if (checkForUpdate) {
      checkForUpdateAndNotify();
    }
  }

  public render() {
    const { searchInProgress, videos, message, onRemoveVideo } = store;
    return (
      <div className="main">
        <AppMenu />
        <Form
          hasResult={!!videos.length}
          onSubmit={store.search}
          onClear={() => store.clearResult()}
          inProcess={searchInProgress}
        >
          {videos.length ?
            <div>
              <ButtonProgress text={`Download All (${videos.length})`}  onClick={this.downloadAll} />
              <div className="videos">
                {videos.map((video, i) => (
                  <Video
                    key={video.id}
                    video={video}
                    onVideoDownloadClick={this.downloadVideo}
                    onRemoveVideo={onRemoveVideo}
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
          !store.isFFMpegInstalled && <InstallFFMpeg onDone={() => store.isFFMpegInstalled = true} onError={showCustomError} />
        }
        <AboutModal open={store.isAboutOpen} onClose={closeModal} />
        <PreferencesModal open={store.isPreferencesOpen} onClose={closeModal} />
        <div className={classNames(['messages', message.position, {'-visible': message.isVisible}])}>
          <Message color={message.color} compact>{message.content}</Message>
        </div>
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