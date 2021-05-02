import * as React from 'react';
import store from '../mobx/store';
import { SemanticCOLORS } from 'semantic-ui-react';
import { MessagePosition, MessageContent } from '../types';
import { ExternalLink } from '../components/external-link';
import { runInAction } from 'mobx';

let currentOpen: 'about' | 'preferences';

export function openAbout() {
  store.isAboutOpen = true;
  currentOpen = 'about';
}

export function openPreferences() {
  store.isPreferencesOpen = true;
  currentOpen = 'preferences';
}

export function closeModal() {
  switch (currentOpen) {
    case 'about':
      store.isAboutOpen = false
      break;
    case 'preferences':
      store.isPreferencesOpen = false;
    break;``
  }
}

export function showNoInternet() {
  showMessage('red', `Seems like I'm not connected to the internet`, 3000);
}

export function showCustomError(error: string) {
  showMessage('red', error, 3000);
}

export function showTermsIsInvalid() {
  showMessage('red', `Can't find media (url is not supported, invalid or private video)`, 3000);
}

export function showSuccessPasted() {
  showMessage('green', 'The url was taken from the clipboard! Just hit the "search" button', 4000, 'top');
}

export function showPlaylistHasMore() {
  showMessage('blue', 'Showing only top 100 items', 4000, 'top');
}

export function showAppHasUpdate() {
  showMessage('blue',
    <span>
      🎉 There is a new version - <ExternalLink className='has-underline' href="https://github.com/moshfeu/y2mp3/releases/latest">Download</ExternalLink>
    </span>,
  4000, 'top');
}

async function showMessage(color: SemanticCOLORS, content: MessageContent, time: number = 0, position: MessagePosition = 'bottom') {
  await hideMessage();
  const { message } = store;
  runInAction(() => {
    message.position = position;
    message.color = color;
    message.content = <div>🤖 {content}</div>;
  })
  message.isVisible = true;
  if (!!time) {
    hideMessage(time);
  }
}

let hideTimeout: NodeJS.Timeout;
export function hideMessage(timeout: number = 0) {
  clearTimeout(hideTimeout);
  return new Promise<void>((resolve) => {
    hideTimeout = setTimeout(() => {
      store.message.isVisible = false;
      resolve();
    }, timeout);
  })
}