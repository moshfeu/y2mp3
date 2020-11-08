import { observable, computed, action, toJS } from 'mobx';
import { IVideoEntity, EVideoStatus, IMessage } from '../types';
import { fetchVideos, removeAllVideos } from '../services/api';
import { IVideoTask } from '../services/youtube-mp3-downloader';
import { isFFMpegInstalled } from '../services/ffmpeg-installer';
import {
  showTermsIsInvalid,
  hideMessage,
  showNoInternet,
} from '../services/modalsAndAlerts';

class Store {
  @observable searchTerm: string;
  @observable videos: IVideoEntity[] = [];
  @observable searchInProgress: boolean;
  @observable isFFMpegInstalled: boolean;
  @observable isAboutOpen: boolean;
  @observable isPreferencesOpen: boolean;
  @observable termsIsInvalid: boolean;
  @observable hasUpdate: boolean;
  @observable message: IMessage = {
    isVisible: false,
  };

  constructor() {
    this.isFFMpegInstalled = isFFMpegInstalled();
  }

  @action search = async (term: string): Promise<void> => {
    this.searchTerm = term;
    this.searchInProgress = true;
    hideMessage();
    removeAllVideos();
    try {
      const videos = await fetchVideos(this.searchTerm);
      if (!videos.length) {
        showTermsIsInvalid();
        return;
      }
      this.videos = videos;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        showNoInternet();
      }
    } finally {
      this.searchInProgress = false;
    }
  };

  @action removeVideo = (videoId: string): void => {
    const videoIndex = this.videos.findIndex((v) => v.id === videoId);
    this.videos.splice(videoIndex, 1);
  };

  @action clearResult(): void {
    this.videos = [];
  }

  @action addToQueue = (videoId: string) => {
    const video = this.getVideo(videoId);
    video.status = EVideoStatus.PENDING;
    video.progress = 0;
    console.log('addToQueue', toJS(video));
  };

  @action gettingInfo = (videoId: string) => {
    const video = this.getVideo(videoId);
    if (!video) {
      return;
    }
    video.status = EVideoStatus.GETTING_INFO;
    this.countProgressUntil(video, 19);
  };

  @action progress = (
    { videoId, progress }: IVideoTask,
    video: IVideoEntity = this.getVideo(videoId)
  ) => {
    // in case of searching while the download in progress
    if (video) {
      video.status = EVideoStatus.DOWNLOADING;
      video.progress = 20 + Math.floor(progress.percentage * 0.8);
    }
  };

  @action finished = (err, { videoId }: { videoId: string }) => {
    const video = this.getVideo(videoId);
    // in case of searching while the download in progress
    if (video) {
      video.status = err ? EVideoStatus.ERROR : EVideoStatus.DONE;
      video.progress = 0;
    }
  };

  @computed get hasVideosInQueue(): boolean {
    return !!this.videos.length;
  }

  getVideo(videoId: string): IVideoEntity {
    return this.videos.find((video) => video.id === videoId);
  }

  private countProgressUntil(video: IVideoEntity, until: number): void {
    const makeProgress = () => {
      const { progress, status } = video;
      if (progress === until || status !== EVideoStatus.GETTING_INFO) {
        return;
      }
      video.progress = Math.min(
        progress + (1 + Math.floor(Math.random() * 4)),
        until
      );
      setTimeout(() => {
        makeProgress();
      }, Math.random() * 500);
    };
    makeProgress();
  }
}

export default new Store();
