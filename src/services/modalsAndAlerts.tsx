import * as React from 'react';
import store from '../mobx/store';
import { SemanticCOLORS } from 'semantic-ui-react';
import { MessagePosition, MessageContent } from '../types';
import { ExternalLink } from '../components/ExternalLink';

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

export function showTermsIsInvalid() {
  showMessage('red', `Can't find media (url is not supported, invalid or private video)`, 3000);
}

export function showSuccessPasted() {
  showMessage('green', 'The url was taken from the clipboard! Just hit the "search" button', 4000, 'top');
}

export function showAppHasUpdate() {
  showMessage('blue',
    <span>
      🎉 There is a new version - <ExternalLink className='has-underline' href="https://github.com/moshfeu/y2mp3/releases/latest">Download</ExternalLink>
    </span>,
  4000, 'top');
}

function showMessage(color: SemanticCOLORS, content: MessageContent, time: number = 0, position: MessagePosition = 'bottom') {
  const { message } = store;
  message.position = position;
  message.color = color;
  message.content = <div>🤖 {content}</div>;
  message.isVisible = true;
  if (!!time) {
    hideMessage(time);
  }
}

export function hideMessage(timeout: number = 0) {
  if (timeout) {
    setTimeout(() => {
      store.message.isVisible = false;
    }, timeout);
  } else {
    store.message.isVisible = false;
  }
}