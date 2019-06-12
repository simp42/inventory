import React, {Component} from 'react';
import {Route, Switch} from "react-router";
import Login from "./pages/Login";
import {BrowserRouter} from "react-router-dom";
import StitchConnectionContext from "./data/StitchConnectionContext";
import {RemoteMongoClient, Stitch} from 'mongodb-stitch-browser-sdk';
import ImportArticles from "./pages/ImportArticles";
import InventoryOverview from "./pages/InventoryOverview";
import StockSearchAndEdit from "./pages/StockSearchAndEdit";
import InventoryNavigation from "./components/InventoryNavigation";

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
            <div className="container">
                <StitchConnectionContext.Provider value={this.state}>
                    <BrowserRouter>
                        <div className="row">
                            <InventoryNavigation/>
                            <Switch>
                                <Route exact path="/" component={InventoryOverview}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/import" component={ImportArticles}/>
                                <Route path="/stock/" component={StockSearchAndEdit}/>
                            </Switch>
                        </div>
                    </BrowserRouter>
                </StitchConnectionContext.Provider>
            </div>
        );
    }
}

export default App;
