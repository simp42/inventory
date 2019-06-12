import React, {Component} from 'react';
import styles from '../styles/SearchResultsList.module.scss';
import classNames from 'classnames';

class SearchResultsList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    ensureNbsp(data) {
        if (!data ||
            (data.length && data.length === 0)) {
            return <>&nbsp;</>;
        }

        return data;
    }

    itemSelected(ev) {
        ev.preventDefault();

        if (! this.props.itemSelected) {
            return;
        }

        let elem = ev.target;

        const checkElem = el => {
            if (!el) {
                return false;
            }

            if (!el.dataset) {
                return false;
            }

            return !el.dataset.hasOwnProperty('key');
        };

        let safety = 10;
        while (checkElem(elem) && safety > 0) {
            elem = elem.parentElement;
            safety--;
        }

        if (safety <= 0) {
            return;
        }

        const itemKey = elem.dataset.key;

        this.props.itemSelected(itemKey);
    }

    render() {
        let itemKey = -1;
        const selected = this.itemSelected.bind(this);

        return (
            <ul className={styles["search-results-list"]}>
                {this.props.searchResults.map(el => {
                        itemKey++;
                        return <li data-key={itemKey}
                                   onClick={selected}
                                   key={'searchResults_' + itemKey}>
                            {this.props.columns.map(col =>
                                <React.Fragment key={'searchResults_' + itemKey + '_' + col.key}>
                                    <div className={styles.name}>
                                        {col.name}
                                    </div>
                                    <div className={classNames(styles.value, col.highlight ? styles.highlight : '')}>
                                        {this.ensureNbsp(el[col.key])}
                                    </div>
                                </React.Fragment>
                            )}
                        </li>
                    }
                )}
            </ul>
        );
    }
}

export default SearchResultsList;