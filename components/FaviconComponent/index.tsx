import * as React from 'react';
let Favicon = require("react-favicon");
import icons from './favicons'
import {switchFavicon} from "app/const/api";

export namespace FaviconComponentNamespace {
  export interface Props {
  }
}

export class FaviconComponent extends React.Component<FaviconComponentNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    let icon: any = (icons as any)[switchFavicon()];
    return (<Favicon url={icon}/>);
  }
}
