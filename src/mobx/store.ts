import { observable, computed, action, toJS } from 'mobx';
import { IVideoEntity, EVideoStatus } from '../types';
import { fetchVideos } from '../services/api';
import { IVideoTask } from 'youtube-mp3-downloader';
import { isFFMpegInstalled } from '../services/ffmpeg-installer';

class Store {
  @observable searchTerm: string;
  @observable videos: IVideoEntity[] = [];
  @observable searchInProgress: boolean;
  @observable isFFMpegInstalled: boolean;
  @observable isAboutOpen: boolean;
  @observable isPreferencesOpen: boolean;

  constructor() {
    this.isFFMpegInstalled = isFFMpegInstalled();
  }

  @action search = async (term: string): Promise<void> => {
    this.searchTerm = term;
    this.searchInProgress = true;
    this.videos = await fetchVideos(this.searchTerm);
    this.searchInProgress = false;
  }

  @action clearResult(): void {
    this.videos = [];
  }

  @action addToQueue = (videoId: string) => {
    const video = this.getVideo(videoId);
    video.status = EVideoStatus.PENDING;
    video.progress = 0;
    console.log(toJS(this.videos), 'addToQueue');
  }

  @action gettingInfo = (videoId: string) => {
    const video = this.getVideo(videoId);
    video.status = EVideoStatus.GETTING_INFO;
    this.countProgressUntil(video, 19);
    console.log(toJS(this.videos), 'gettingInfo');
  }

  @action progress = ({videoId, progress}: IVideoTask) => {
    const video = this.getVideo(videoId);
    video.status = EVideoStatus.DOWNLOADING;
    video.progress = 20 + Math.floor(progress.percentage * 0.8);
    console.log(toJS(this.videos), progress, 'progress');
  }

  @action finished = (err, { videoId }: { videoId: string }) => {
    const video = this.getVideo(videoId);
    video.status = EVideoStatus.DONE;
    video.progress = 0;
    console.log('done');

    if (err) {
      alert(err);
    }
  }

  @computed get hasVideosInQueue(): boolean {
    return !!this.videos.length;
  }

  private getVideo(videoId: string): IVideoEntity {
    return this.videos.find(video => video.id === videoId);
  }

  private countProgressUntil(video: IVideoEntity, until: number): void {
    const makeProgress = () => {
      const {progress, status} = video;
      if (progress === until || status !== EVideoStatus.GETTING_INFO) {
        return;
      }
      video.progress = Math.min(progress + (1 + Math.floor(Math.random() * 4)), until);
      setTimeout(() => {
        makeProgress()
      }, Math.random()*500);
    }
    makeProgress();
  }
}

export default new Store();