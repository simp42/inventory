import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";

class InventoryHome extends React.Component {
    render() {
        if (this.props.user.isLoggedIn()) {
            this.props.stockRepository.getAllStock().then(
                (stock) => console.log(stock)
            );

        }
        return <div>Inventory home {this.props.user.isLoggedIn() ? 'Logged in' : 'Not logged in'}</div>;
    }
}

export default withStitchAccess(InventoryHome);
