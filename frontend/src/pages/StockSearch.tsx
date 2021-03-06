import * as React from 'react';
import {withRouter} from "react-router";
import ProgressSpinner from "../components/ProgressSpinner";
import {ReactTimeoutProps, Timer} from 'react-timeout';
import ReactTimeout from 'react-timeout';
import SearchResultsList from "../components/SearchResultsList";
import {WithMongoAccess, WithMongoAccessProps} from "../data/WithMongoAccess";
import {RouteComponentProps} from "react-router-dom";

interface StockSearchProps extends WithMongoAccessProps, RouteComponentProps, ReactTimeoutProps {
    searchTerm?: string | null,
    searchResults: any[],
    searchDone: boolean,
    updateSearchResults: (searchTerm: string, results: any[]) => void,
    createGridColumns: () => Promise<any[]>,
    editStock: (stockId: string) => void
}

interface StockSearchState {
    searchTerm: string,
    searching: boolean,
    timeoutId: Timer | null,
    gridColumns: any[]
}

class StockSearch extends React.Component<StockSearchProps, StockSearchState> {
    private readonly searchInput: React.RefObject<HTMLInputElement>;

    constructor(props: StockSearchProps) {
        super(props);

        this.state = {
            searchTerm: this.props.searchTerm ?? '',
            searching: false,
            timeoutId: null,
            gridColumns: []
        };

        this.searchInput = React.createRef();
    }

    updateSearch(value: string, timeoutLength?: number) {
        const timeout: number = (timeoutLength === undefined) ? 1000 : timeoutLength;

        if (this.state.timeoutId !== null && this.props.clearTimeout !== undefined) {
            this.props.clearTimeout(this.state.timeoutId);
        }

        let newState: any = {
            searchTerm: value.trim(),
            timeoutId: null
        };

        if (value.length > 2 && this.props.setTimeout !== undefined) {
            newState.timeoutId = this.props.setTimeout(this.doSearch.bind(this), timeout);
        }

        this.setState(newState);
    }

    async doSearch() {
        const searchTerm = this.state.searchTerm.trim();

        if (searchTerm.length === 0) {
            return;
        }

        if (this.state.timeoutId && this.props.clearTimeout !== undefined) {
            this.props.clearTimeout(this.state.timeoutId);
        }

        this.setState({searching: true});

        // Load the article schema
        const schema = await this.props.articlesRepository!.ensureArticlesSchema();

        // Search for articles with the given search term
        const results = await this.props.stockRepository!.searchStock(
            this.props.user?.id() ?? '',
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

    async clearSearch() {
        await this.setState({
            searching: false,
            searchTerm: ''
        });

        this.searchInput.current?.focus();
    }

    resultItemSelected(selectedIndex: number) {
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

    async createGridColumns(): Promise<any[]> {
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

        if (this.props.searchTerm!.length > 0) {
            this.updateSearch(this.props.searchTerm!, 1);
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
                               maxLength={100}
                               placeholder="Product name / UPC / ..."
                               value={this.state.searchTerm}
                               onChange={(ev) => this.updateSearch(ev.target.value)}
                               ref={this.searchInput}
                        />
                    </div>
                    <div className="four columns u-pull-left" style={{textAlign: 'right'}}>
                        <label htmlFor="doSearch">&nbsp;</label>

                        <button id="doSearch" className="button-primary" onClick={ev => {
                            ev.preventDefault();
                            this.doSearch();
                        }}>Search
                        </button>

                        <button id="doClearSearch" className="button" onClick={ev => {
                            ev.preventDefault();
                            this.clearSearch();
                        }}>Clear
                        </button>
                    </div>
                </div>
            </form>

            {this.searchResults()}
        </>;
    }
}

export default withRouter(WithMongoAccess(ReactTimeout(StockSearch)));
