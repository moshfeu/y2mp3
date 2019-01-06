import store from '../mobx/store';

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

export function showTermsIsInvalid() {
  store.termsIsInvalid = true;
  setTimeout(() => {
    store.termsIsInvalid = false;
  }, 3000);
}