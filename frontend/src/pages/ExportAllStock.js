import React, {Component} from 'react';
import ProgressSpinner from "../components/ProgressSpinner";
import {withStitchAccess} from "../data/withStitchAccess";
import ReactDataGrid from "react-data-grid";
import * as Excel from "exceljs";
import {saveAs} from 'file-saver';

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
            gridData: this.createGridData(schema, Object.keys(users)),
            articles: articles,
            allStock: allStock,
            users: Object.keys(users),
            indexes: this.sortGrid(articles, {}, schema[0].key, 'NONE')
        });
    }

    createGridData(schema, users) {
        let gridColumns = [];
        let xlsxColumns = [];
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

                xlsxColumns.push({
                    key: key,
                    name: key,
                    width: 15
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

                xlsxColumns.push({
                    key: key,
                    name: key,
                    width: 25
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

            xlsxColumns.push({
                key: key,
                name: users[i],
                width: 15,
                isAggregateColumn: true
            });

            accessors[key] = (obj) => {
                if (!obj._counts ||
                    !obj._counts[users[i]]) {

                    return null;
                }

                return obj._counts[users[i]]
            };
        }

        return {
            columns: gridColumns,
            xlsxColumns: xlsxColumns,
            accessors: accessors
        };
    }

    /**
     * Return an array containing the sorted article ids of all the articles by given sort direction and column
     * @param articles
     * @param accessors
     * @param sortColumn
     * @param sortDirection
     * @returns {string[]}
     */
    sortGrid(articles, accessors, sortColumn, sortDirection) {
        let sortedIndexes = [];
        const articleIds = Object.keys(articles);

        if (sortDirection === 'NONE') {
            // No sorting, just return objects ids in order of keys
            for (const article of articleIds) {
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

    /**
     * Export the grid with article counts as an excel file
     * @param ev
     * @returns {Promise<void>}
     */
    async exportDataToExcel(ev) {
        ev.preventDefault();

        const overviewColumns = this.state.gridData.xlsxColumns;
        const wb = new Excel.Workbook();
        wb.creator = process.env.REACT_APP_TITLE;

        wb.created = new Date();
        this.exportOverviewToExcel(wb, overviewColumns);


        for(let i = 0; i < this.state.users.length; i++) {
            const user = this.state.users[i];
            const userStock = this.state.allStock.filter(a => a.user_email === user && a.counted && a.counted.length > 0);

            if (userStock.length === 0) {
                continue;
            }

            this.exportUserStockDetailsToExcel(user, wb, overviewColumns, userStock);
        }

        const buf = await wb.xlsx.writeBuffer();

        saveAs(new Blob([buf]),
            process.env.REACT_APP_TITLE.replace(' ', '_') + '-' +
            wb.created.toISOString().substring(0, 10) +
            '.xlsx');
    }

    /**
     * Export the overview of all articles to an excel sheet
     * @param wb
     * @param overviewColumns
     */
    exportOverviewToExcel(wb, overviewColumns) {
        const sheetOverview = wb.addWorksheet('Overview');
        sheetOverview.autoFilter = 'A1:Z1';
        sheetOverview.views = [
            {state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2'}
        ];

        // Write headers
        let headerData = [];
        for (let i = 0; i < overviewColumns.length; i++) {
            headerData.push(overviewColumns[i].name);
        }
        const row = sheetOverview.addRow(headerData);
        row.font = {bold: true};
        row.commit();

        // Write data rows of sorted articles
        const accessors = this.state.gridData.accessors;
        for (let row = 0; row < this.state.indexes.length; row++) {
            const article = this.state.articles[this.state.indexes[row]];
            let rowData = [];

            for (let column = 0; column < overviewColumns.length; column++) {
                const data = accessors[overviewColumns[column].key](article);
                rowData.push(data);
            }

            const datarow = sheetOverview.addRow(rowData);
            datarow.font = {bold: false};
            datarow.commit();
        }

        // Set column width
        for (let column = 1; column <= overviewColumns.length; column++) {
            let col = sheetOverview.getColumn(column);
            col.width = overviewColumns[column - 1].width;
        }
    }

    /**
     * Export detailed information about every change in stock count for a single user
     * @param user
     * @param wb
     * @param overviewColumns
     * @param userStock
     */
    exportUserStockDetailsToExcel(user, wb, overviewColumns, userStock) {
        let sheetName = user;
        if (sheetName.length > 30) {
            sheetName = sheetName.substr(0, 30);
        }
        const sheetUser = wb.addWorksheet(sheetName);
        sheetUser.autoFilter = 'A1:Z1';
        sheetUser.views = [
            {state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2', activeCell: 'A2'}
        ];

        const accessors = this.state.gridData.accessors;

        let headerData = [];
        let detailAccessors = [];

        for (let i = 0; i < overviewColumns.length; i++) {
            if (overviewColumns[i].isAggregateColumn) {
                continue;
            }

            headerData.push(overviewColumns[i].name);
            detailAccessors.push(accessors[overviewColumns[i].key]);
        }
        headerData.push('Count Date');
        detailAccessors.push((obj, i) => {
            return obj.counted[i].created_at;
        });
        headerData.push('Count');
        detailAccessors.push((obj, i) => {
            return obj.counted[i].change;
        });

        const row = sheetUser.addRow(headerData);
        row.font = {bold: true};
        row.commit();

        for (let stockIndex = 0; stockIndex < userStock.length; stockIndex++) {
            const stock = userStock[stockIndex];

            for (let changeRow = 0; changeRow < stock.counted.length; changeRow++) {
                let rowData = [];

                for (let column = 0; column < detailAccessors.length; column++) {
                    rowData.push(detailAccessors[column](stock, changeRow));
                }

                const datarow = sheetUser.addRow(rowData);
                datarow.font = {bold: false};
                datarow.commit();
            }
        }
    }

    showStockDataGrid() {
        if (this.state.loadingStep > 0 ||
            !this.state.gridData ||
            !this.state.articles) {

            return null;
        }

        return <>
            <ReactDataGrid
                columns={this.state.gridData.columns}
                rowGetter={i => this.state.articles[this.state.indexes[i]]}
                rowsCount={this.state.indexes.length}
                onGridSort={(sortColumn, sortDirection) => {
                    const sorted = this.sortGrid(this.state.articles, this.state.gridData.accessors, sortColumn, sortDirection);
                    this.setState({indexes: sorted});
                }}
            />

            <button onClick={this.exportDataToExcel.bind(this)}>Download Excel</button>
        </>;
    }

    render() {
        return <form>
            <div className="row">
                <h2>Export all stock</h2>
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