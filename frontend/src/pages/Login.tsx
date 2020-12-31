import React from "react";
import {WithMongoAccess, WithMongoAccessProps} from "../data/WithMongoAccess";
import {withRouter, RouteComponentProps} from "react-router-dom";

interface LoginProps extends WithMongoAccessProps, RouteComponentProps {
}

interface LoginState {
    email?: string,
    password?: string,
    error: boolean
}

class Login extends React.Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);

        this.state = {
            email: '',
            password: '',
            error: false
        };
    }

    async login() {
        const email: string = this.state.email !== undefined ? this.state.email.trim() : '';
        const password: string = this.state.password !== undefined ? this.state.password.trim() : '';

        if (email.length > 1 && password.length > 1) {
            const loginSucceeded = await this.props.user!.login(email, password);

            if (!loginSucceeded) {
                this.setState({
                    password: '',
                    error: true
                });
            } else {
                this.props.history.push('/');
            }
        }

        return false;
    }

    async logout() {
        await this.props.user!.logout();
        if (!this.props.user!.isLoggedIn()) {

            this.props.history.push('/');
        }
    }

    logoutForm() {
        // {this.props.dataProvider.currentUser().profile.data.email}
        return (
            <form>
                <h2>Logout</h2>

                <p>You are currently logged in as {this.props.user!.profile()!.email}</p>
                <button id="logoutButton"
                        onClick={(ev) => {
                            ev.preventDefault();
                            this.logout();
                        }}>
                    Logout
                </button>
            </form>
        );
    }

    loginForm() {
        const error = (this.state.error) ? <p className="error">Login error</p> : '';

        return (
            <form>
                <h2>Login</h2>

                {error}

                <div className="row">

                    <div className="twelve columns">
                        <label htmlFor="email">E-Mail:</label>
                        <input
                            type="email"
                            className="u-full-width"
                            value={this.state.email}
                            onChange={(ev) => this.setState({email: ev.target.value})}
                            id="email"
                            name="email"
                            placeholder="Your E-Mail"/>
                    </div>
                </div>
                <div className="row">
                    <div className="twelve columns">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            className="u-full-width"
                            value={this.state.password}
                            onChange={(ev) => this.setState({password: ev.target.value})}
                            id="password"
                            name="password"
                            placeholder="Password"
                        />

                    </div>
                </div>
                <div className="row">
                    <button className="button-primary" id="login" onClick={(ev) => {
                        ev.preventDefault();
                        this.login()
                    }}>Login
                    </button>
                </div>
            </form>
        );
    }


    render() {
        return this.props.user!.isLoggedIn() ? this.logoutForm() : this.loginForm();
    }
}

export default withRouter(WithMongoAccess(Login));
