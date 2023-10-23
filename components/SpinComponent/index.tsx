import * as React from 'react';
import {Spin} from 'antd';

export namespace SpinComponentNamespace {
  export interface Props {
  }
}

export class SpinComponent extends React.Component<SpinComponentNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Spin
        style={
          {
            position: 'absolute',
            top: '50%',
            left: '50%'
          }}/>
    );
  }
}
