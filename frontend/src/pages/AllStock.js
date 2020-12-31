import React, {Component} from 'react';
import SearchResultsList from "../components/SearchResultsList";
import ProgressSpinner from "../components/ProgressSpinner";
import {WithMongoAccess} from "../data/WithMongoAccess";

class AllStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            stock: [],
            gridColumns: []
        };
    }

    componentDidMount() {
        const userid = this.props.user.id();

        this.props.createGridColumns().then(columns => {
            this.setState({gridColumns: columns});
        });

        this.props.stockRepository.getAllStock(userid).then(stock => {
            this.setState({
                stock: stock,
                loading: false
            });
        });
    }

    resultItemSelected(selectedIndex) {
        if (!this.state.stock ||
            !this.state.stock[selectedIndex]
        ) {

            console.error('Results does not seem to contain row ' + selectedIndex);
        }

        const stockId = this.state.stock[selectedIndex]._id;

        this.props.editStock(stockId);
    }

    render() {
        const content = this.state.loading ?
            <ProgressSpinner/> :
            <SearchResultsList
                columns={this.state.gridColumns}
                searchResults={this.state.stock}
                itemSelected={this.resultItemSelected.bind(this)}
            />;

        return <>
            <h2>Show all stock</h2>

            <div className="row">
                {content}
            </div>
        </>;
    }
}

export default WithMongoAccess(AllStock);
