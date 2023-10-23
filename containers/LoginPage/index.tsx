import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import localization from 'app/localization/index';
import {Form, Icon, Input, Button, Row, Col, Alert} from 'antd';

const FormItem = Form.Item;
import {login, switchRoute} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import api from 'app/const/api';
import {ERRORS} from 'app/const/errors';
import {isPageGameHistoryAuth} from "app/utils";

let hashInputRef: any;
let lang = localStorage.getItem('lang') || 'en';
export namespace LoginPage {
  export interface Props extends RouteComponentProps<any> {
    logIn: any;
    loading: boolean;
    error: any;
    sessionId: any;
  }

  export interface State {
    login: string;
    password: string;
    roundId: string;
  }
}

@connect((state): any => ({
    loading: state.request.loggingIn,
    error: state.request.error,
    sessionId: state.request.sessionId
  }),
  (dispatch: any): any => ({
    logIn: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.LOGIN);
      let data = {
        url: api.LOG_IN,
        method: ajaxRequestTypes.METHODS.POST,
        params: {
          login: that.state.login,
          password: that.state.password
        }
      };
      login(types, data, that.props.history, dispatch, isPageGameHistoryAuth());
    }
  })
)
class LoginPageVO extends React.Component<LoginPage.Props, LoginPage.State> {

  constructor(props: LoginPage.Props, context?: any) {
    super(props, context);
    this.state = {
      login: '',
      password: '',
      roundId: ''
    };
  }

  componentDidMount() {
    if (localStorage.getItem("sessionId") && !isPageGameHistoryAuth()) {
      switchRoute(this.props.history)
    }
  }

  handlePasswordInputChange(e: any) {
    this.setState({
      password: e.target.value
    });
  };

  validateLoginInput(err: any): any {
    switch (err.code) {
      case ERRORS.AUTH.ALREADY_LOGGED_IN: {
        break;
      }
    }
  }

  handleLoginInputChange(e: any) {
    this.setState({
      login: e.target.value
    });
  };

  handleRoundIDInputChange(e: any) {
    this.setState({
      roundId: e.target.value
    });
  };

  handleOpenGameHistory = (e: any) => {
    let path = `round-history?hash=${this.props.sessionId}&roundId=${this.state.roundId}`;
    this.props.history.push(path);
  };

  render() {
    return (
      <Row type="flex" justify="space-around" align="middle"
           style={{position: 'absolute', height: '100%', width: '100%'}}>
        <Col xs={22} sm={16} md={12} lg={6} xl={6}>
          <Form className="login-form">
            <FormItem>
              <Input
                prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                placeholder={(localization.LOGIN as any)[lang]}
                onChange={e => this.handleLoginInputChange(e)}/>
            </FormItem>
            <FormItem>
              <Input
                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                type="password"
                placeholder={(localization.PASSWORD as any)[lang]}
                onChange={e => this.handlePasswordInputChange(e)}/>
            </FormItem>
            <FormItem>
              <Row type="flex" justify="space-around" align="middle">
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Button
                    loading={this.props.loading}
                    type="primary"
                    htmlType="submit"
                    className="login-form-button" style={{width: '100%'}}
                    onClick={(e: any) => this.props.logIn(this)}>
                    {isPageGameHistoryAuth()?"Get Hash":(localization.LOGIN as any)[lang]}
                  </Button>
                </Col>
              </Row>
            </FormItem>
            {
              this.props.error ?
                <Alert
                  message={this.props.error ? this.props.error.message : ""}
                  type="error"
                />
                :
                null
            }
            <br/>
            {
              isPageGameHistoryAuth()?
                <FormItem>
                  <Input
                    title={"Click To Copy"}
                    ref={(el)=>{hashInputRef = el}}
                    prefix={<span onClick={(e: any)=>{
                      hashInputRef.select();
                      document.execCommand('copy');
                      e.stopPropagation();
                    }}><Icon type="copy"/></span>}
                    onClick={(e: any)=>{
                      e.target.select();
                      document.execCommand('copy');
                    }}
                    value={this.props.sessionId}
                    placeholder={"Hash"}/>
                </FormItem>:null
            }
            {
              isPageGameHistoryAuth()?
                <FormItem>
                  <Input
                    prefix={<Icon type="number" style={{color: 'rgba(0,0,0,.25)'}}/>}
                    onChange={e => this.handleRoundIDInputChange(e)}
                    placeholder={"Round ID"}/>
                </FormItem>:null
            }
            {
              isPageGameHistoryAuth()?
                <FormItem>
                  <Row type="flex" justify="space-around" align="middle">
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Button
                        disabled={!this.state.roundId || !this.props.sessionId}
                        loading={this.props.loading}
                        type="primary"
                        htmlType="submit"
                        className="login-form-button" style={{width: '100%'}}
                        onClick={this.handleOpenGameHistory}>
                        {"Open Game History"}
                      </Button>
                    </Col>
                  </Row>
                </FormItem>:null
            }
          </Form>
        </Col>
      </Row>
    );
  }
}

export const LoginPage = withRouter(LoginPageVO);
