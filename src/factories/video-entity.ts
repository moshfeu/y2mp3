import { IVideoEntity, EVideoStatus } from '../types';

export function createVideoEntity(name: string, id: string, playlistName?: string): IVideoEntity {
  return {
    name,
    id,
    progress: 0,
    status: EVideoStatus.NOT_STARTED,
    playlistName
  }
}