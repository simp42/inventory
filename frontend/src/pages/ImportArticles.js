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
                const columnData = currentRow[j]
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
                <p>Please confirm your data was loaded correctly and confirm that all previous data will be overwritten</p>
                <ReactDataGrid
                    columns={gridHeaders}
                    rowGetter={i => this.state.articles[i]}
                    rowsCount={this.state.articles.length}
                />

                <button onClick={ev => {
                    // Import articles
                    ev.preventDefault();
                    this.setState({working: true});
                    this.props.articlesRepository.saveAll(this.state.articles);
                    this.props.history.push('/');
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
        if (this.state.working) {
            return <ProgressSpinner/>;
        }

        if (! this.state.articles) {
            return this.showUploadForm();
        }

        return this.showDataTable();
    }
}

export default withRouter(withStitchAccess(ImportArticles));
