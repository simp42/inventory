import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import CSVReader from "react-csv-reader";
import ProgressSpinner from "../components/ProgressSpinner";
import ReactDataGrid from 'react-data-grid';
import {withRouter} from "react-router";

class ImportArticles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            working: false,
            articles: null,
            headers: [],
        }
    }

    handleArticleRows(rows) {
        const headers = rows[0];
        let data = [];
        for (let i = 1; i < rows.length; i++) {
            const currentRow = rows[i];

            let notEmptyColumn = 0;
            let newRow = {};

            for (let j = 0; j < currentRow.length; j++) {
                const columnData = currentRow[j];
                if (columnData.length > 0) {
                    notEmptyColumn++;
                    newRow[headers[j]] = columnData;
                }
            }

            if (notEmptyColumn > 0) {
                data.push(newRow);
            }
        }

        this.setState({
            headers: headers,
            articles: data,
            working: false
        });
    }

    showUploadForm() {
        return (
            <div>

                <form>
                    <CSVReader
                        cssClass="csv-reader-input"
                        label="Select a CSV file to import articles"
                        onFileLoaded={(result) => {
                            this.setState({working: true});
                            this.handleArticleRows(result);
                        }}
                        onError={(error) => {alert(error)}}
                        inputId="importcsv"
                    />
                </form>
            </div>
        );
    }

    showDataTable() {
        const gridHeaders = this.state.headers.map(column => { return { key: column, name: column}});

        return (
            <div>
                <h2>Confirm data</h2>
                <p>Please confirm your data was loaded correctly.
                    <strong>Note: Importing these articles will replace every article in the database</strong>
                </p>

                <ReactDataGrid
                    columns={gridHeaders}
                    rowGetter={i => this.state.articles[i]}
                    rowsCount={this.state.articles.length}
                />

                <br/>

                <button className="button-primary" onClick={ev => {
                    // Import articles
                    ev.preventDefault();
                    if (window.confirm('This will replace all articles and make old counts inaccessible, are you sure?')) {
                        this.setState({working: true});
                        this.props.articlesRepository.saveSchema(this.state.headers).then(
                            this.props.articlesRepository.deleteAllArticles().then(() =>
                                this.props.articlesRepository.insertArticles(this.state.articles).then(() => this.props.history.push('/'))
                            )
                        );
                    }
                }}>Import articles</button>

                <button onClick={ev => {
                    // Cancel import
                    ev.preventDefault();
                    this.setState({
                        articles: null,
                        headers: []
                    });
                }}>Cancel</button>

            </div>
        )
    }

    render() {
        let content = null;

        if (this.state.working) {
            content = <ProgressSpinner/>;
        } else if (! this.state.articles) {
            content = this.showUploadForm();
        } else {
            content = this.showDataTable();
        }

        return <>
            <h1>Import articles</h1>
            {content}
        </>;
    }
}

export default withRouter(withStitchAccess(ImportArticles));
