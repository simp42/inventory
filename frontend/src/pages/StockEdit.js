import React from 'react';
import {withStitchAccess} from "../data/withStitchAccess";
import ProgressSpinner from "../components/ProgressSpinner";

class StockEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stockId: this.props.stockId,
            stock: null,
            schema: null,
            newCount: 0,
            saving: false
        };
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const stock = await this.props.stockRepository.getStockById(this.props.stockId);
        const schema = await this.props.articlesRepository.ensureArticlesSchema();

        this.setState({
            stock: stock,
            newCount: stock.count,
            schema: schema
        });
    }

    getChangeDescription() {
        const delta = this.getCountChangeDelta();
        if (delta === 0) {
            return <>&nbsp;</>;
        }

        if (delta > 0) {
            return <small>{delta} more</small>;
        }

        return <small>{-1 * delta} fewer</small>;
    };

    getCountChangeDelta() {
        if (!this.state.stock ||
            !this.state.stock.count) {
            return this.state.newCount;
        }

        return this.state.newCount - this.state.stock.count;
    }

    getArticleDescription() {
        const getStockData = (key) => this.state.stock[key];

        const writeUpcRows = (schemarow) => {
            if (schemarow.type !== 'upc') {
                return null;
            }

            return <h2 key={schemarow.key}>{getStockData(schemarow.key)} - {getStockData('count')}</h2>;
        };

        const writeDataRows = (schemarow) => {
            if (schemarow.type === 'upc') {
                return null;
            }

            return <div key={schemarow.key} className="row">
                <div className="four columns">
                    <strong>{schemarow.key}</strong>
                </div>
                <div className="eight columns">
                    <p>{getStockData(schemarow.key)}</p>
                </div>
            </div>;
        };

        return <>
            {this.state.schema.map(writeUpcRows)}
            {this.state.schema.map(writeDataRows)}
        </>;
    }

    history() {
        if (!this.state.stock.counted ||
            this.state.stock.counted.length === 0) {
            return null;
        }

        let i = 0;
        return <>
            <div className="row">
                <div className="twelve columns">
                    <h3>History</h3>
                </div>
            </div>

            {this.state.stock.counted.reverse().map(count =>
                <div key={'change' + (i++)} className="row">
                    <div className="six columns">
                        {`${count.created_at.toLocaleDateString() + ' ' + count.created_at.toLocaleTimeString()}`}
                    </div>
                    <div className="six columns">
                        {Math.abs(count.change)} {count.change > 0 ? 'added' : 'subtracted'}
                    </div>
                </div>
            )}
        </>;

    }

    save() {
        let stock = this.state.stock;
        this.setState({saving: true});
        this.doSave(stock, this.getCountChangeDelta());
    }

    async doSave(stock, delta) {
        const saved = await this.props.stockRepository.addCountToStock(stock, delta);
        if (! saved) {
            alert(saved);
        }
        this.props.editDone();
    }

    render() {
        if (!this.state.stock ||
            this.state.saving ||
            this.state.schema.length === 0
        ) {
            return <ProgressSpinner/>;
        }

        return <>
            <form>

                {this.getArticleDescription()}

                <div className="row">
                    <div className="twelve columns">
                        <hr/>
                    </div>
                </div>

                <div className="row">
                    <div className="four columns">
                        <label htmlFor="newCount">Current count:</label>
                    </div>
                    <div className="eight columns">
                        <input type="number"
                               id="newCount"
                               className="u-full-width"
                               value={this.state.newCount}
                               onChange={(ev) => this.setState({newCount: parseInt(ev.target.value)})}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="four columns">
                        {this.getChangeDescription()}
                    </div>
                    <div className="four columns">
                        <button className="u-full-width"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.setState({newCount: this.state.newCount + 1});
                                }}
                                style={{fontSize: '200%'}}>+
                        </button>
                    </div>
                    <div className="four columns">
                        <button className="u-full-width"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    const newCount = this.state.newCount - 1;
                                    this.setState({newCount: newCount >= 0 ? newCount : 0});
                                }}
                                style={{fontSize: '200%'}}>-
                        </button>
                    </div>
                </div>

                <div className="row">
                    <div className="six columns">
                        <button className="u-full-width button-primary"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.save();
                                }}
                        >Save
                        </button>
                    </div>
                    <div className="six columns">
                        <button className="u-full-width"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.props.cancelEdit();
                                }}
                        >Cancel
                        </button>

                    </div>
                </div>

                {this.history()}
            </form>
        </>;
    }
}

export default withStitchAccess(StockEdit);
