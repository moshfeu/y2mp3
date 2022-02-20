import * as React from 'react'
import { shell } from 'electron';

interface ExternalLinkProps {
  href: string;
  children: string | React.ReactChild | React.ReactChild[];
  className?: string;
}

export const ExternalLink = (props: ExternalLinkProps) => <a className={props.className} href="#" onClick={e => {
  e.preventDefault();
  shell.openExternal(props.href);
}}>{props.children}</a>