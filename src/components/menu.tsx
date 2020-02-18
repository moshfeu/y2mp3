import * as React from 'react';
import { Dropdown, Icon, Label } from 'semantic-ui-react';
import { openPreferences, openAbout } from '../services/modalsAndAlerts';
import { shell } from '../services/electron-adapter';
import { GITHUB_LINK, CONTACT_EMAIL, GITHUB_LINK_ISSUES, TWITTER_LINK, TWITTER_LINK_PROFILE } from '../constants';
import store from '../mobx/store';


export default function AppMenu() {
  return (<div className="app-menu">
    <Dropdown closeOnChange value={''} icon={
      <>
        <Icon name="bars" size="big" />
        {store.hasUpdate && <Label className="has-update-not" circular color="blue" floating empty />}
      </>
    }>
      <Dropdown.Menu>
        <Dropdown.Item onClick={openAbout}><Icon name="info" /> About</Dropdown.Item>
        <Dropdown.Item onClick={openPreferences}><Icon name="options" /> Options</Dropdown.Item>
        {store.hasUpdate &&
          <Dropdown.Item onClick={() => shell.openExternal('https://github.com/moshfeu/y2mp3/releases/latest')}><Icon name="refresh" /> Update Available</Dropdown.Item>
        }
        <Dropdown.Divider />
        <Dropdown.Header>Help / Feedback</Dropdown.Header>
        <Dropdown.Item onClick={() => shell.openExternal(`${CONTACT_EMAIL}?subject=I have an idea! | Something is not working as expected :(`)}><Icon name="mail" /> Email</Dropdown.Item>
        <Dropdown.Item onClick={() => shell.openExternal(GITHUB_LINK_ISSUES)}><Icon name="github" />Github</Dropdown.Item>
        <Dropdown.Item onClick={() => shell.openExternal(TWITTER_LINK)}><Icon name="twitter" />Twitter</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => shell.openExternal(GITHUB_LINK)}><Icon name="group" />Want to contribute?</Dropdown.Item>
        <Dropdown.Item onClick={() => shell.openExternal(TWITTER_LINK_PROFILE)}><Icon name="heart" color="red" />Made by @moshfeu</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </div>)
}