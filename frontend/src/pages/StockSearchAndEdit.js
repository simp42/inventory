import React from 'react';
import StockSearch from "./StockSearch";
import {Route, Switch, withRouter} from "react-router";
import StockEdit from "./StockEdit";

class StockSearchAndEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: '',
            searchDone: false,
            searchResults: null
        };
    }

    setSearchResults(searchTerm, results) {
        this.setState({
            searchDone: true,
            searchResults: results,
            searchTerm: searchTerm
        });
    }

    async editStock(stockId) {
        this.props.history.push('/stock/edit/' + stockId.toString());
    }

    async editDone() {
        this.props.history.goBack();
        this.setState({
            searchDone: false,
            searchResults: null
        });
    }

    goBack() {
        this.props.history.goBack();
    }

    render() {
        return <>
            <Switch>
                <Route path="/stock/search" render={() =>
                    <StockSearch searchTerm={this.state.searchTerm}
                                 searchResults={this.state.searchResults}
                                 searchDone={this.state.searchDone}
                                 updateSearchResults={this.setSearchResults.bind(this)}
                                 editStock={this.editStock.bind(this)}

                    />
                }/>
                <Route path="/stock/edit/:stockId" render={(el) => {
                    return <StockEdit stockId={el.match.params.stockId}
                                      editDone={this.editDone.bind(this)}
                                      cancelEdit={this.goBack.bind(this)}
                    />
                }}/>
            </Switch>
        </>;
    }
}

export default withRouter(StockSearchAndEdit);
