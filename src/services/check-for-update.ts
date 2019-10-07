import { remote } from './electron-adapter';
import { showAppHasUpdate } from './modalsAndAlerts';


export async function checkForUpdateAndNotify() {
  const currentVersion = remote.app.getVersion();
  const latestVersion = await fetch('https://api.github.com/repos/moshfeu/y2mp3/releases/latest')
                                .then(data => data.json())
                                .then(data => data.name.replace('v', ''));
  if (currentVersion !== latestVersion) {
    showAppHasUpdate();
  }
}