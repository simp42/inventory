import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {withRouter} from "react-router";
import styles from '../styles/modules/InventoryOverview.module.sass';
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
            importingStock: false
        };
    }

    componentDidMount() {
        this.reloadOverview();
    }

    reloadOverview() {
        if (this.props.user.isLoggedIn()) {
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
        if (! this.props.user.isLoggedIn) {
            return;
        }

        this.setState({importingStock: true});

        const userId = this.props.user.id();
        const articles = await this.props.articlesRepository.getAllArticlesIterator();
        let result = await this.props.stockRepository.recreateStockFromArticlesIterator(userId, articles);

        this.setState({importingStock: false});
        return result;
    }

    render() {
        const note = (this.state.totalArticles > 0 &&
            !!this.state.totalStockInInventory >= 0 &&
            this.state.totalStockInInventory < this.state.totalArticles) ?
            <p className={styles.warning}>The number of articles in your inventory is less than the total number of
                articles in the database, you may need to start a new inventory session</p> :
            null;

        const importStock = (this.state.importingStock) ?
            <ProgressSpinner/> :
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
                    }}>Restart inventory</button>
                <br/><strong>Note: This will delete all your current counted articles!</strong>
            </div>;

        return <>
            <h1>Inventory Overview</h1>
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
                    <td>Counted articles:</td>
                    <td>{this.state.countedArticles}</td>
                </tr>
                </tbody>
            </table>

            {importStock}
        </>;
    }
}

export default withRouter(withStitchAccess(InventoryOverview));
