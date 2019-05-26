import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {withRouter} from "react-router";
import ProgressSpinner from "../components/ProgressSpinner";
import ReactDataGrid from "react-data-grid";
import ReactTimeout from 'react-timeout';

class StockSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: this.props.searchTerm,
            searching: false,
            timeoutId: null,
            gridColumns: []
        };

        this.searchInput = React.createRef();
    }

    updateSearch(value, timeoutLength) {
        const timeout = (timeoutLength === undefined) ? 1000 : timeoutLength;

        if (this.state.timeoutId) {
            this.props.clearTimeout(this.state.timeoutId);
        }

        let newState = {
            searchTerm: value.trim(),
            timeoutId: null
        };

        if (value.length > 2) {
            newState.timeoutId = this.props.setTimeout(this.doSearch.bind(this), timeout);
        }

        this.setState(newState);
    }

    async doSearch() {
        const searchTerm = this.state.searchTerm.trim();

        if (searchTerm.length === 0) {
            return;
        }

        if (this.state.timeoutId) {
            this.props.clearTimeout(this.state.timeoutId);
        }

        this.setState({searching: true});

        // Load the article schema
        const schema = await this.props.articlesRepository.ensureArticlesSchema();

        // Search for articles with the given search term
        const results = await this.props.stockRepository.searchStock(
            this.props.user.id(),
            schema,
            searchTerm
        );

        this.setState({
            searching: false,
            timeoutId: null
        });

        this.props.updateSearchResults(
            searchTerm,
            results
        );
    }

    gridColumnClicked(event, selectedIndex) {
        event.preventDefault();

        if (!this.props.searchResults ||
            !this.props.searchResults[selectedIndex.rowIdx]
        ) {

            console.error('Results does not seem to contain row ' + selectedIndex.rowIdx);
        }

        const stockId = this.props.searchResults[selectedIndex.rowIdx]._id;

        this.props.editStock(stockId);
    }

    searchResults() {
        if (this.state.searching) {
            return <ProgressSpinner/>;
        }

        if (!this.props.searchDone) {
            return null;
        }

        if (!this.props.searchResults || this.props.searchResults.length === 0) {
            return <p className="warning">No results</p>;
        }

        return <ReactDataGrid
            columns={this.state.gridColumns}
            rowGetter={i => this.props.searchResults[i]}
            rowsCount={this.props.searchResults.length}
        />;
    }

    async createGridColumns() {
        // Load the article schema
        const schema = await this.props.articlesRepository.ensureArticlesSchema();

        let gridColumns = [];

        const eventHandlers = {
            onClick: this.gridColumnClicked.bind(this)
        };

        // Construct column definitions fpr the result grid
        const monospacedFont = (val) => {
            return <p className="monospaced">{val.value}</p>;
        };

        // Make sure the UPC columns are first
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type === 'upc') {
                gridColumns.push({
                    key: schema[i].key,
                    name: schema[i].key,
                    width: 150,
                    formatter: monospacedFont,
                    events: eventHandlers
                });
            }
        }

        // Now add non-UPC columns
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type !== 'upc') {
                gridColumns.push({
                    key: schema[i].key,
                    name: schema[i].key,
                    resizeable: true,
                    events: eventHandlers
                });
            }
        }

        // Add a column for the current count
        gridColumns.push({
            key: 'count',
            name: '#',
            formatter: monospacedFont,
            events: eventHandlers
        });

        return gridColumns;
    }

    componentDidMount() {
        // Set focus to search field
        if (this.searchInput.current) {
            this.searchInput.current.focus();
        }

        this.createGridColumns().then(columns => {
            this.setState({gridColumns: columns});
        });

        if (this.props.searchTerm.length > 0) {
            this.updateSearch(this.props.searchTerm, 1);
        }
    }

    render() {
        return <>
            <h1>Article search</h1>
            <form>
                <div className="row">
                    <div className="eight columns">
                        <label htmlFor="search">Search</label>
                        <input type="text"
                               className="u-full-width"
                               maxLength="100"
                               placeholder="Product name / UPC / ..."
                               value={this.state.searchTerm}
                               onChange={(ev) => this.updateSearch(ev.target.value)}
                               ref={this.searchInput}
                        />
                    </div>
                    <div className="three columns" style={{textAlign: 'right'}}>
                        <label htmlFor="doSearch">&nbsp;</label>
                        <button id="doSearch" className="button-primary" onClick={ev => {
                            ev.preventDefault();
                            this.doSearch();
                        }}>Search
                        </button>
                    </div>
                </div>
            </form>

            <div className="row">
                {this.searchResults()}
            </div>
        </>;
    }
}

export default withRouter(withStitchAccess(ReactTimeout(StockSearch)));
