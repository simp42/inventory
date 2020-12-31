import React from 'react';
import StockSearch from "./StockSearch";
import {Route, Switch, withRouter} from "react-router";
import StockEdit from "./StockEdit";
import AllStock from "./AllStock";
import {WithMongoAccess} from "../data/WithMongoAccess";

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

    async createResultsColumns() {
        // Load the article schema
        const schema = await this.props.articlesRepository.ensureArticlesSchema();

        let gridColumns = [];

        // Make sure the UPC columns are first
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type === 'upc') {
                gridColumns.push({
                    key: schema[i].key,
                    name: schema[i].key,
                    highlight: true
                });
            }
        }

        // Now add non-UPC columns
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type !== 'upc') {
                gridColumns.push({
                    key: schema[i].key,
                    name: schema[i].key,
                    highlight: false
                });
            }
        }

        // Add a column for the current count
        gridColumns.push({
            key: 'count',
            name: 'Counted',
            highlight: true
        });

        return gridColumns;
    }

    render() {
        return <>
            <Switch>
                <Route path="/stock/search" render={() =>
                    <StockSearch searchTerm={this.state.searchTerm}
                                 searchResults={this.state.searchResults}
                                 searchDone={this.state.searchDone}
                                 updateSearchResults={this.setSearchResults.bind(this)}
                                 createGridColumns={this.createResultsColumns.bind(this)}
                                 editStock={this.editStock.bind(this)}

                    />
                }/>
                <Route path="/stock/all" render={() =>
                    <AllStock editStock={this.editStock.bind(this)}
                              createGridColumns={this.createResultsColumns.bind(this)}
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

export default WithMongoAccess(withRouter(StockSearchAndEdit));
