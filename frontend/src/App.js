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
import ExportAllStock from "./pages/ExportAllStock";
import FooterCredits from "./components/FooterCredits";

class App extends Component {
    constructor(props) {
        super(props);

        const stitchAppId = process.env.REACT_APP_STITCH_APP_ID;
        if (stitchAppId.length > 1) {
            const cluster = process.env.REACT_APP_MONGODB_CLUSTER;
            const database = process.env.REACT_APP_MONGODB_DATABASE;

            const client = Stitch.initializeDefaultAppClient(stitchAppId);
            const db = client.getServiceClient(RemoteMongoClient.factory, cluster).db(database);

            this.state = {
                stitchClient: client,
                db: db
            };
        } else {
            alert('Stitch app id is not configured, please add to your .env.prodution file');
        }
    }

    render() {
        return (
            // <!-- Route component={Notfound} /-->
            <div className="container">
                <StitchConnectionContext.Provider value={this.state}>
                    <BrowserRouter>
                        <div className="row">
                            <InventoryNavigation/>

                            <h1>{process.env.REACT_APP_TITLE}</h1>

                            <Switch>
                                <Route exact path="/" component={InventoryOverview}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/stock/" component={StockSearchAndEdit}/>
                                <Route path="/import" component={ImportArticles}/>
                                <Route path="/export" component={ExportAllStock}/>
                            </Switch>
                        </div>
                    </BrowserRouter>
                </StitchConnectionContext.Provider>

                <FooterCredits/>
            </div>
        );
    }
}

export default App;
