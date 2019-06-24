import React, {Component} from 'react';
import ProgressSpinner from "../components/ProgressSpinner";
import {withStitchAccess} from "../data/withStitchAccess";
import ReactDataGrid from "react-data-grid";

class ExportAllStock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadingStep: 0
        };
    }

    componentDidMount() {
        this.loadData();
    }

    showLoading() {
        if (this.state.loadingStep === 0) {
            return null;
        }

        if (this.state.loadingStep === 1) {
            return <>
                <p>Loading articles...</p>
                <ProgressSpinner/>
            </>;
        }

        if (this.state.loadingStep === 2) {
            return <>
                <p>Loading stock counts...</p>
                <ProgressSpinner/>
            </>;
        }

        if (this.state.loadingStep === 3) {
            return <>
                <p>Merging data</p>
                <ProgressSpinner/>
            </>;
        }
    }

    async loadData() {
        if (this.state.data) {
            return;
        }

        this.setState({loadingStep: 1});

        const schema = await this.props.articlesRepository.ensureArticlesSchema();
        const articlesArray = await this.props.articlesRepository.getAllArticles();
        // Convert articles array to hash map
        let articles = {};
        for (const article of articlesArray) {
            const id = article._id.toString();
            article._counts = {};
            articles[id] = article;
        }

        this.setState({loadingStep: 2});
        const allStock = await this.props.stockRepository.getAllStock();

        this.setState({loadingStep: 3});
        // Merge all user's stock into the articles, tking note of the users we saw
        let users = {};
        for (const stock of allStock) {
            const articleId = stock.article_id.toString();
            const email = stock.user_email;
            if (email === undefined) {
                continue;
            }

            users[stock.user_email] = 1;
            if (articles[articleId]) {
                articles[articleId]._counts[stock.user_email] = stock.count;
            }
        }

        this.setState({
            loadingStep: 0,
            gridColumns: this.createGridColumns(schema, Object.keys(users)),
            articles: articles,
            allStock: allStock,
            indexes: this.sortGrid(articles, {}, schema[0].key, 'NONE')
        });
    }

    createGridColumns(schema, users) {
        let gridColumns = [];
        let accessors = {};

        // Construct column definitions fpr the result grid
        const monospacedFont = (val) => {
            return <p className="monospaced">{val.value}</p>;
        };
        const getCountForUser = (user) => (val) => {
            let value = <>&nbsp;</>;
            if (val.row._counts &&
                val.row._counts[user]
            ) {
                value = val.row._counts[user];
            }

            return <p className="monospaced">{value}</p>
        };

        // Make sure the UPC columns are first
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type === 'upc') {
                const key = schema[i].key;

                gridColumns.push({
                    key: key,
                    name: key,
                    width: 150,
                    sortable: true,
                    formatter: monospacedFont
                });

                accessors[key] = (obj) => obj[key];
            }
        }

        // Now add non-UPC columns
        for (let i = 0; i < schema.length; i++) {
            if (schema[i].type !== 'upc') {
                const key = schema[i].key;

                gridColumns.push({
                    key: key,
                    name: key,
                    resizeable: true,
                    sortable: true,
                });

                accessors[key] = (obj) => obj[key];
            }
        }

        for (let i = 0; i < users.length; i++) {
            const key = '_count_' + i;

            gridColumns.push({
                key: key,
                name: users[i],
                sortable: true,
                formatter: getCountForUser(users[i])
            });

            accessors[key] = (obj) => {
                if (! obj._counts ||
                    ! obj._counts[users[i]]) {

                    return null;
                }

                return obj._counts[users[i]]
            };
        }

        return {
            columns: gridColumns,
            accessors: accessors
        };
    }

    /**
     * Return an array containing the sorted article ids of all the articles by given sort direction and column
     * @param articles
     * @param sortColumn
     * @param sortDirection
     * @returns {string[]}
     */
    sortGrid(articles, accessors, sortColumn, sortDirection) {
        let sortedIndexes = [];
        const articleIds = Object.keys(articles);

        if (sortDirection === 'NONE') {
            // No sorting, just return objects ids in order of keys
            for(const article of articleIds) {
                sortedIndexes.push(article);
            }

            return sortedIndexes;
        }

        const comparer = (a, b) => {
            const valA = accessors[sortColumn](articles[a]);
            const valB = accessors[sortColumn](articles[b]);

            if (sortDirection === "ASC") {
                return valA > valB ? 1 : -1;
            } else if (sortDirection === "DESC") {
                return valA < valB ? 1 : -1;
            }
        };

        return articleIds.sort(comparer);
    }

    showStockDataGrid() {
        if (this.state.loadingStep > 0 ||
            !this.state.gridColumns ||
            !this.state.articles) {

            return null;
        }

        return <>
            <ReactDataGrid
                columns={this.state.gridColumns.columns}
                rowGetter={i => this.state.articles[this.state.indexes[i]]}
                rowsCount={this.state.indexes.length}
                onGridSort={(sortColumn, sortDirection) => {
                    const sorted = this.sortGrid(this.state.articles, this.state.gridColumns.accessors, sortColumn, sortDirection);
                    this.setState({indexes: sorted});
                }}
            />
        </>;
    }

    render() {
        return <form>
            <div className="row">
                <h1>Export all stock</h1>
                <div className="twelve columns">
                    <p>Show stock of all users by UID</p>

                    {this.showLoading()}
                    {this.showStockDataGrid()}
                </div>
            </div>
        </form>
    }
}

export default withStitchAccess(ExportAllStock);