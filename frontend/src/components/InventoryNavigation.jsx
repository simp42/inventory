import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {withRouter} from "react-router";
import {withStitchAccess} from "../data/withStitchAccess";
import classNames from 'classnames';

class InventoryNavigation extends Component {
    constructor(props) {
        super(props);

        this.state = this.getDefaultState();
    }

    getDefaultState() {
        if (window.innerHeight <= 599) {
            return {
                toggled: false,
                showNav: false
            };
        }

        return {
            toggled: false,
            showNav: true
        }
    }

    reset() {
        this.setState(this.getDefaultState());
    }

    render() {
        const currentUser = this.props.user;

        if (this.state.showNav) {
            return (
                <nav className={classNames('main', this.state.toggled ? 'toggled' : '')}>
                    <ul>
                        <li>
                            <Link onClick={this.reset.bind(this)} to="/login">{currentUser.isLoggedIn() ? 'Logout' : 'Login'}</Link>
                        </li>
                        <li>
                            <Link onClick={this.reset.bind(this)} to="/">Home</Link>
                        </li>
                        <li>
                            <Link onClick={this.reset.bind(this)} to="/import">Import</Link>
                        </li>
                        <li>
                            <Link onClick={this.reset.bind(this)} to="/stock/search">Search</Link>
                        </li>
                    </ul>
                </nav>
            );
        } else {
            return (
                <svg version="1.1" x="0px" y="0px"
                     onClick={(ev) => this.setState({showNav: true, toggled: true})}
                     viewBox="0 0 30 30" style={{
                        width: '30px',
                        height: '30px'
                    }}>
                    <g>
                        <rect y="8" width="50" height="3"/>
                        <rect y="16" width="50" height="3"/>
                        <rect y="24" width="50" height="3"/>
                    </g>
                </svg>
            );
        }
    }
}

export default withRouter(withStitchAccess(InventoryNavigation));