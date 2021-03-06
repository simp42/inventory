import React from 'react';
import {Link, RouteComponentProps} from "react-router-dom";
import {withRouter} from "react-router";
import classNames from 'classnames';
import {WithMongoAccess, WithMongoAccessProps} from "../data/WithMongoAccess";

interface InventoryNavigationProps extends WithMongoAccessProps, RouteComponentProps {
}

interface InventoryNavigationState {
    toggled: boolean,
    showNav: boolean,
    isAdmin: boolean

}

class InventoryNavigation extends React.Component<InventoryNavigationProps, InventoryNavigationState> {
    constructor(props:InventoryNavigationProps) {
        super(props);

        this.state = this.getDefaultState(false);
    }

    getDefaultState(isAdmin: boolean) {
        if (window.innerHeight <= 599) {
            return {
                toggled: false,
                showNav: false,
                isAdmin: isAdmin
            };
        }

        return {
            toggled: false,
            showNav: true,
            isAdmin: isAdmin
        }
    }

    componentDidMount() {
        this.props.user?.isAdmin().then(res => {
            this.setState({isAdmin: res});
        });
    }

    reset() {
        this.setState(this.getDefaultState(this.state.isAdmin));
    }

    showImport() {
        if (this.state.isAdmin) {
            return <li>
                <Link onClick={this.reset.bind(this)} to="/import">Import</Link>
            </li>;
        }

        return null;
    }

    showExport() {
        if (this.state.isAdmin) {
            return <li>
                <Link onClick={this.reset.bind(this)} to="/export">Export</Link>
            </li>;
        }

        return null;
    }

    render() {
        const currentUser = this.props.user;

        if (this.state.showNav) {
            return <>
                <div className="navcontainer">
                    <img className="icon" src={process.env.PUBLIC_URL + '/android-chrome-192x192.png'} alt="Logo"/>

                    <nav className={classNames('main', this.state.toggled ? 'toggled' : '')}>
                        <ul>
                            <li>
                                <Link onClick={this.reset.bind(this)}
                                      to="/login">{currentUser?.isLoggedIn() ? 'Logout' : 'Login'}</Link>
                            </li>
                            <li>
                                <Link onClick={this.reset.bind(this)} to="/">Home</Link>
                            </li>
                            <li>
                                <Link onClick={this.reset.bind(this)} to="/stock/all">Show all stock</Link>
                            </li>
                            <li>
                                <Link onClick={this.reset.bind(this)} to="/stock/search">Search stock</Link>
                            </li>
                            {this.showImport()}
                            {this.showExport()}
                        </ul>
                    </nav>
                </div>
            </>;
        } else {
            return (
                <div className="navcontainer">
                    <svg version="1.1" x="0px" y="0px"
                         onClick={() => this.setState({showNav: true, toggled: true})}
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
                </div>
            );
        }
    }
}

export default withRouter(WithMongoAccess(InventoryNavigation));
