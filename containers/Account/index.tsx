import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {BackTop, Form, Input, Icon, Button, message} from 'antd';
import {ajaxRequestTypes} from "app/actionTypes";
import {connect} from 'react-redux';
import api from 'app/const/api';
import req from "app/actions/ajaxRequest";
import {InfoPanel} from "app/components/InfoPanel";
import {getRoleById} from "app/const/roles";
import {isDeviceMobileAndTablet, isDeviceMobile, validatePassword} from "app/utils";

import './style.css';


export namespace Account {
  export interface Props extends RouteComponentProps<void> {
    changePassword: (that: any) => void;
  }

  export interface State {
    password: string;
    passwordConfirmation: string;
    [key: string]: any;
  }
}


@connect((state): any => ({
  }),
  (dispatch: any): any => ({
    
    
    changePassword: (that: any) => {
      const passwordValidated = validatePassword(that.state.password, that.state.userLogin); 
      
      if (!passwordValidated.valid) {
        that.setState({
          passwordError: passwordValidated.message,
          passwordErrorClass: true
        });
        message.error(passwordValidated.message);
        return;
      }
      
      if (!that.isConfirm()){
        that.setState({
          passwordError: 'Password and confirmation do not match!',
          passwordErrorClass: true
        });
        message.error(that.state.passwordError);
        return
      }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_PASSWORD);
      let params = { password: that.state.password };
      let url = api.ACCOUNT_PASSWORD;
      
      let data = {
        url: url,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          that.setState({
            passwordShow: {
              visible: false,
              type: 'password',
              icon: 'eye'
            },
            confirmShow: {
              visible: false,
              type: 'password',
              icon: 'eye'
            },
            password: '',
            passwordConfirmation: '',
            passwordError: 'Password must consist of a minimum of 8 alphanumeric characters only and  contain at least 1 uppercase character',
            passwordErrorClass: false
          });
          message.success('Password has changed successfully!');
        }
      });
    },
  })
)

class AccountVO extends React.Component<Account.Props, Account.State> {

  constructor(props: any) {
    super(props);
    this.state = {
      passwordShow: {
        visible: false,
        type: 'password',
        icon: 'eye'
      },
      confirmShow: {
        visible: false,
        type: 'password',
        icon: 'eye'
      },
      userId: localStorage.getItem('userId') as string,
      userRoleId: getRoleById(parseInt(localStorage.getItem('roleId') as string)),
      userLogin: localStorage.getItem('login'),
      password: '',
      passwordConfirmation: '',
      passwordErrorClass: false,
      passwordError: 'Password must consist of a minimum of 8 alphanumeric characters only and  contain at least 1 uppercase character',
    };
    this.passwordVisibility = this.passwordVisibility.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.passwordConfirmationChange = this.passwordConfirmationChange.bind(this);
  }
  isConfirm(): boolean {
    return this.state.password == this.state.passwordConfirmation;
  }
  passwordChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }

  passwordConfirmationChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ passwordConfirmation: event.target.value });
  }

  passwordVisibility(input: any) {
    if(!this.state[`${input}Show`].visible) {
      if(input == 'password') {
        this.setState({
          passwordShow: {
            visible: true,
            type: 'text',
            icon: 'eye-invisible'
          }
        })
      } else {
        this.setState({
          confirmShow: {
            visible: true,
            type: 'text',
            icon: 'eye-invisible'
          }
        })
      }
    } else {
      if(input == 'password') {
        this.setState({
          passwordShow: {
            visible: false,
            type: 'password',
            icon: 'eye'
          }
        })
      } else {
        this.setState({
          confirmShow: {
            visible: false,
            type: 'password',
            icon: 'eye'
          }
        })
      }
    }
    console.log(this.state.passwordVisibility);
  }

  render() {
    return (
      <div className={'gutter-box-padding'} id={'help-container'}>
        <InfoPanel
          goBack={false}
          loading={false}
          affixContainer={() => (!isDeviceMobileAndTablet() ? (document.getElementById('help-container') as any).parentElement : window)}
          infoText={[]}
          title={`Account: ${this.state.userLogin}`}
        />
        {isDeviceMobile() && <BackTop />}
        <div className='account-row account-row_user-info'>
          <span className='account-row__title'>User Info</span>
          <table>
            <tbody>
              <tr>
                <td>Id:</td>
                <td>{this.state.userId}</td>
              </tr>
              <tr>
                <td>Role:</td>
                <td>{this.state.userRoleId}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='account-row account-row_password-form'>
          <span className='account-row__title'>Change Password</span>
          <Form
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              this.props.changePassword(this);
            }}
            layout = "vertical"
            className = "change-password-form">
            <Form.Item label="New Password" >
                <Icon 
                  type={`${this.state.passwordShow.icon}`}
                  className={`icon`}
                  aria-hidden='true'
                  onClick = {this.passwordVisibility.bind(this, 'password')}
                />
                <Input
                  prefix = {<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type={this.state.passwordShow.type}
                  placeholder = "Password"
                  value={this.state.password}
                  onChange = {this.passwordChange}
                />
            </Form.Item>
            <Form.Item label="Password Confirmation">
                <Icon 
                  type={`${this.state.confirmShow.icon}`}
                  className={`icon`}
                  aria-hidden='true'
                  onClick = {this.passwordVisibility.bind(this, 'confirm')}
                />
                <Input
                  prefix = {<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type={this.state.confirmShow.type}
                  placeholder = "Password Confirmation"
                  value={this.state.passwordConfirmation}
                  onChange = {this.passwordConfirmationChange}
                />
            </Form.Item>
            <span className={`error-info ${ this.state.passwordErrorClass && 'error-info_red'}`}>{this.state.passwordError}</span>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="passworg-form-button">
                Save
              </Button>
            </Form.Item>
          </Form>
        
        </div>
      </div>
      );
  }
}

export const Account = withRouter(AccountVO);


