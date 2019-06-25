import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {withRouter} from "react-router";
import ProgressSpinner from "../components/ProgressSpinner";

class InventoryOverview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: null,
            totalArticles: null,
            totalStockInInventory: null,
            countedArticles: null,
            lastCountedArticles: null,
            importingStep: 0
        };
    }

    componentDidMount() {
        this.reloadOverview();
    }

    reloadOverview() {
        if (this.props.user.isLoggedIn()) {
            this.props.articlesRepository.ensureArticlesSchema();

            var myUserId = this.props.user.id();
            this.setState({userId: myUserId});

            this.props.articlesRepository.countArticles(myUserId).then(data =>
                this.setState({totalArticles: data})
            );

            this.props.stockRepository.countAllStock(myUserId).then(data =>
                this.setState({totalStockInInventory: data})
            );

            this.props.stockRepository.countCountedStock(myUserId).then(data =>
                this.setState({countedArticles: data})
            );
        }
    }

    async recreateStockFromArticles() {
        if (!this.props.user.isLoggedIn) {
            return;
        }

        const userId = this.props.user.id();
        const userEmail = this.props.user.profile().email;

        this.setState({importingStep: 1});
        const articles = await this.props.articlesRepository.getAllArticlesIterator();

        this.setState({importingStep: 2});
        await this.props.stockRepository.deleteAllStock(userId);

        this.setState({importingStep: 3});
        let result = await this.props.stockRepository.recreateStockFromArticlesIterator(userId, userEmail, articles);

        this.setState({importingStep: 0});
        return result;
    }

    showImportProgress() {
        if (this.state.importingStep === 0) {
            return null;
        }

        let message = '';
        switch (this.state.importingStep) {
            case 1:
                message = 'Loading new article data';
                break;
            case 2:
                message = 'Deleting old stock';
                break;
            case 3:
                message = 'Creating new inventory from article data';
                break;
            default:
                message = '';
        }
        return <>
            <div className="six rows">
                <p>{message}</p>
            </div>
            <ProgressSpinner/>
        </>;
    }

    render() {
        const note = (this.state.totalArticles > 0 &&
            !!this.state.totalStockInInventory >= 0 &&
            this.state.totalStockInInventory < this.state.totalArticles) ?
            <p className="warning">The number of articles in your inventory is less than the total number of
                articles in the database, you may need to start a new inventory session</p> :
            null;

        const importStock = this.state.importingStep === 0 ?
            <div className="six rows">
                <button id="restartInventory"
                        onClick={(ev) => {
                            ev.preventDefault();
                            if (window.confirm('This will delete all your counted articles, are you sure?')) {
                                this.recreateStockFromArticles().then((result) => {
                                    if (result) {
                                        this.reloadOverview();
                                    }
                                });
                            }
                        }}>Restart inventory
                </button>
                <br/><strong>Note: This will delete all your current counted articles!</strong>
            </div> : null;

        return <>
            <h2>Overview</h2>
            {note}
            <table>
                <tbody>
                <tr>
                    <td>Total articles:</td>
                    <td>{this.state.totalArticles}</td>
                </tr>
                <tr>
                    <td>Total articles in your inventory:</td>
                    <td>{this.state.totalStockInInventory}</td>
                </tr>
                <tr>
                    <td>Articles in stock with count:</td>
                    <td>{this.state.countedArticles}</td>
                </tr>
                </tbody>
            </table>

            {this.showImportProgress()}
            {importStock}
        </>;
    }
}

export default withRouter(withStitchAccess(InventoryOverview));
