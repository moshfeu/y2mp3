import * as React from 'react'
import { shell } from '../services/electron-adapter';

interface ExternalLinkProps {
  href: string;
  children: string | React.ReactChild | React.ReactChild[];
  className?: string;
}

export const ExternalLink = (props: ExternalLinkProps) => <a className={props.className} href="javascript:void(0)" onClick={() => {
  shell.openExternal(props.href);
}}>{props.children}</a>