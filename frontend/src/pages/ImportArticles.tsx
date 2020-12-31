import React from 'react';
import CSVReader from "react-csv-reader";
import ProgressSpinner from "../components/ProgressSpinner";
import ReactDataGrid from "react-data-grid";
import {withRouter} from "react-router";
import {WithMongoAccess, WithMongoAccessProps} from "../data/WithMongoAccess";
import {RouteComponentProps} from "react-router-dom";

interface ImportArticlesProps extends WithMongoAccessProps, RouteComponentProps {
}

interface ImportArticlesState {
    working: boolean,
    articles: any,
    headers: any[]
}

class ImportArticles extends React.Component<ImportArticlesProps, ImportArticlesState> {
    constructor(props: ImportArticlesProps) {
        super(props);

        this.state = {
            working: false,
            articles: null,
            headers: []
        }
    }

    handleArticleRows(rows: any[]) {
        const headers = rows[0];
        let data: any[] = [];
        for (let i = 1; i < rows.length; i++) {
            const currentRow = rows[i];

            let notEmptyColumn: number = 0;
            let newRow: any = {};

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
                        onError={(error) => {
                            alert(error)
                        }}
                        inputId="importcsv"
                    />
                </form>
            </div>
        );
    }

    async importArticles() {
        this.setState({working: true});
        await this.props.articlesRepository!.saveSchema(this.state.headers);
        await this.props.articlesRepository!.deleteAllArticles();
        await this.props.articlesRepository!.insertArticles(this.state.articles);
        await this.props.history.push('/');
    }

    showDataTable() {
        const gridHeaders = this.state.headers.map(column => {
            return {key: column, name: column}
        });

        return (
            <div>
                <h2>Confirm data</h2>
                <p>Please confirm your data was loaded correctly.
                    <strong>Note: Importing these articles will replace every article in the database</strong>
                </p>

                <ReactDataGrid
                    columns={gridHeaders}
                    rowGetter={(i: number) => this.state.articles[i]}
                    rowsCount={this.state.articles.length}
                />

                <br/>

                <button className="button-primary" onClick={async ev => {
                    // Import articles
                    ev.preventDefault();
                    if (window.confirm('This will replace all articles and make old counts inaccessible, are you sure?')) {
                        await this.importArticles();
                    }
                }}>Import articles
                </button>

                <button onClick={ev => {
                    // Cancel import
                    ev.preventDefault();
                    this.setState({
                        articles: null,
                        headers: []
                    });
                }}>Cancel
                </button>

            </div>
        )
    }

    render() {
        let content = null;

        if (this.state.working) {
            content = <ProgressSpinner/>;
        } else if (!this.state.articles) {
            content = this.showUploadForm();
        } else {
            content = this.showDataTable();
        }

        return <>
            <h2>Import articles</h2>
            {content}
        </>;
    }
}

export default withRouter(WithMongoAccess(ImportArticles));
