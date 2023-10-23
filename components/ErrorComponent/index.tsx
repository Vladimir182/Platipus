import * as React from 'react';
import {Row,Icon} from 'antd';
import {getParameterByName} from "app/utils";
import {RouteComponentProps, withRouter} from "react-router";
export namespace ErrorComponentNamespace {
  export interface Props extends RouteComponentProps<any> {
  }
}

class ErrorComponentVO extends React.Component<ErrorComponentNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Row type="flex" justify="space-around" align="middle"
           style={{position: 'absolute', height: '100%', width: '100%'}}>
        <div style={{textAlign:"center"}}>
          <h1 style={{fontSize: "8.5rem", margin: 0}}>{getParameterByName('code', window.location.search)}</h1>
          <Icon onClick={()=>{this.props.history.push("get-hash")}}
                title={"Click to close tab"}
                type="close-circle"
                style={{fontSize: "4rem", marginBottom: "20px", cursor:"pointer"}}
                theme="twoTone" twoToneColor="#f54029"
          />
          <p style={{fontSize: "2.8rem"}}>{getParameterByName('message', window.location.search)}</p>
        </div>
      </Row>
    );
  }
}

export const ErrorComponent = withRouter(ErrorComponentVO);
