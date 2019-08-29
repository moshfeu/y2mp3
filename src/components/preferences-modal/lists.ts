import { IDropdownOption } from '../../types';
import { audioFormats, videoFormats } from '../../services/youtube-mp3-downloader/options';

const toDropdownItems = (option: string, isHeader: boolean = false) => {
  const optionItem: IDropdownOption = {
    text: option,
    value: option,
  }
  if (isHeader) {
    optionItem.disabled = true;
  }
  return optionItem;
};

export const qualityOptions: IDropdownOption[] = ['highest', 'lowest'].map(option => toDropdownItems(option));

const formatsItems = {
  'Audio Formats': 'header',
  ...audioFormats,
  'Video Formats': 'header',
  ...videoFormats,
};
export const formatOptions: IDropdownOption[] = Object.keys(formatsItems).map(key => {
  return toDropdownItems(key, formatsItems[key] === 'header')
});