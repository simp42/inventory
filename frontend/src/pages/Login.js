import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {withRouter} from "react-router";

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.dataProvider = this.props.dataProvider;

        this.state = {
            email: '',
            password: '',
            error: false
        };
    }

    async login() {
        const email = this.state.email.trim();
        const password = this.state.password.trim();

        if (email.length > 1 && password.length > 1) {
            const loginSucceeded = await this.props.user.login(email, password);

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
        await this.props.user.logout();
        if (! this.props.user.isLoggedIn()) {

            this.props.history.push('/');
        }
    }

    logoutForm() {
        // {this.props.dataProvider.currentUser().profile.data.email}
        return (
            <form>
                <p>You are currently logged in as {this.props.user.profile().email}</p>
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
        const error = (this.state.error) ? <p className="error">Login falsch</p> : '';
        return (
            <form>
                {error}

                <label htmlFor="email">E-Mail:</label>
                <input
                    type="email"
                    value={this.state.email}
                    onChange={(ev) => this.setState({email: ev.target.value})}
                    id="email"
                    name="email"
                    placeholder="Your E-Mail"/>

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    value={this.state.password}
                    onChange={(ev) => this.setState({password: ev.target.value})}
                    id="password"
                    name="password"
                    placeholder="Password"
                />

                <button id="login" onClick={(ev) => {
                    ev.preventDefault();
                    this.login()
                }}>Login
                </button>
            </form>
        );
    }


    render() {
        return this.props.user.isLoggedIn() ? this.logoutForm() : this.loginForm();
    }
}

export default withRouter(withStitchAccess(Login));
