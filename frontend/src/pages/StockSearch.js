import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import {withRouter} from "react-router";
import ProgressSpinner from "../components/ProgressSpinner";
import ReactTimeout from 'react-timeout';
import SearchResultsList from "../components/SearchResultsList";

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

    resultItemSelected(selectedIndex) {
        if (!this.props.searchResults ||
            !this.props.searchResults[selectedIndex]
        ) {

            console.error('Results does not seem to contain row ' + selectedIndex);
        }

        const stockId = this.props.searchResults[selectedIndex]._id;

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

        return <SearchResultsList
            columns={this.state.gridColumns}
            searchResults={this.props.searchResults}
            itemSelected={this.resultItemSelected.bind(this)}
        />;
    }

    async createGridColumns() {
        return this.props.createGridColumns();
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
            <h2>Article search</h2>
            <form>
                <div className="row">
                    <div className="eight columns">
                        <label htmlFor="search">Search</label>
                        {/* inputMode="numeric" shows the regular keyboard (unlike type="number") but in number entry mode
                            In my know use cases users prefer to search by EAN, so I'll have the numeric keyboard be preferred
                         */}
                        <input type="text"
                               inputMode="numeric"
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

            {this.searchResults()}
        </>;
    }
}

export default withRouter(withStitchAccess(ReactTimeout(StockSearch)));
