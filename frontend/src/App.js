import React, {Component} from 'react';
import {Route, Switch} from "react-router";
import './App.css';
import InventoryHome from "./pages/InventoryHome";
import Login from "./pages/Login";
import {BrowserRouter, Link} from "react-router-dom";
import StitchConnectionContext from "./data/StitchConnectionContext";
import {RemoteMongoClient, Stitch} from 'mongodb-stitch-browser-sdk';
import ImportArticles from "./pages/ImportArticles";

class App extends Component {
    constructor(props) {
        super(props);

        // TODO: Config
        const stitchAppId = 'inventory-lqqln';
        const cluster = 'inventory-mongodb';
        const database = 'inventory';

        const client = Stitch.initializeDefaultAppClient(stitchAppId);
        const db = client.getServiceClient(RemoteMongoClient.factory, cluster).db(database);

        this.state = {
            stitchClient: client,
            db: db
        };
    }

    render() {
        return (
            // <!-- Route component={Notfound} /-->
            <div className="App">
                <StitchConnectionContext.Provider value={this.state}>
                    <BrowserRouter>
                        <div>
                            <ul>
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                                <li>
                                    <Link to="/login">Login</Link>
                                </li>
                                <li>
                                    <Link to="/import">Import</Link>
                                </li>
                            </ul>
                        </div>
                        <Switch>
                            <Route exact path="/" component={InventoryHome}/>
                            <Route path="/login" component={Login}/>
                            <Route path="/import" component={ImportArticles}/>
                        </Switch>
                    </BrowserRouter>
                </StitchConnectionContext.Provider>

            </div>
        );
    }
}

export default App;
