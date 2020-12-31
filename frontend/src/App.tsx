import React from "react";
import Login from "./pages/Login";
import {BrowserRouter} from "react-router-dom";
import ImportArticles from "./pages/ImportArticles";
import InventoryOverview from "./pages/InventoryOverview";
import StockSearchAndEdit from "./pages/StockSearchAndEdit";
import InventoryNavigation from "./components/InventoryNavigation";
import ExportAllStock from "./pages/ExportAllStock";
import FooterCredits from "./components/FooterCredits";
import {MongoConnectionContextProvider} from "./data/MongoConnectionContext";
import {Route, Switch} from "react-router";
import * as Realm from "realm-web";
import "./styles/App.scss";

interface AppProps {
}

interface AppState {
    realmApp: Realm.App
}

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        const realmAppId = process.env.REACT_APP_STITCH_APP_ID;
        if (realmAppId !== undefined && realmAppId.length > 1) {
            const realmConfig: Realm.AppConfiguration = {
                id: realmAppId
            };
            const app: Realm.App = new Realm.App(realmConfig);

            this.state = {
                realmApp: app
            };
        } else {
            alert('Mongo Realm app id is not configured, please add to your .env.production file');
        }
    }

    render() {
        return (
            // <!-- Route component={Notfound} /-->
            <div className="container">
                <MongoConnectionContextProvider value={{realm: this.state.realmApp}}>
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
                </MongoConnectionContextProvider>

                <FooterCredits/>
            </div>
        );
    }
}

export default App;
