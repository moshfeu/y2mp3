import { IDropdownOption } from '../../types';
import { formats } from 'youtube-mp3-downloader/lib/options';

const toDropdownItems = (option: string) => ({
  text: option,
  value: option,
});

export const qualityOptions: IDropdownOption[] = ['highest', 'lowest'].map(toDropdownItems);
export const formatOptions: IDropdownOption[] = Object.keys(formats).map(toDropdownItems);