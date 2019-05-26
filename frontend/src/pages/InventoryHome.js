import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {Link} from "react-router-dom";

class InventoryHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            articlesCount: null,
            stockCount: null
        };
    }

    componentDidMount() {
        if (this.props.user.isLoggedIn()) {
            this.props.articlesRepository.countArticles().then(data => {
                this.setState({articlesCount: data});
            });
            this.props.stockRepository.countAllStock(this.props.user.id).then(data => {
                this.setState({stockCount: data});
            });
        }
    }

    render() {

        const articlesInto = this.state.articlesCount !== null ?
            <p>There are {this.state.articlesCount} articles in the database, {this.state.stockCount} in your inventory</p> :
            '';
        const restartInventory = (<Link to="/restartInventory">Start new inventory</Link>);

        return (
            <div>
                <h2>Inventory</h2>
                {articlesInto}
                {restartInventory}
            </div>

        );
    }
}

export default withStitchAccess(InventoryHome);
