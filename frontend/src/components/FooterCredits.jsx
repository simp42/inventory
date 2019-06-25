import React, {Component} from 'react';
import styles from '../styles/FooterCredits.module.scss';

class FooterCredits extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const github = "https://github.com/simp42/inventory";
        const iconlink = "https://www.freepik.com/?__hstc=57440181.db8f728746833a8210415040c939b070.1561478359072.1561478359072.1561478359072.1&__hssc=57440181.3.1561478359072&__hsfp=2904469713";

        return <>
            <div className={styles.credits}>
                <ul>
                    <li>
                        Inventory app on <a rel="noopener noreferrer" target="_blank" href={github}>Github</a> under MIT license.
                    </li>
                    <li>
                        Icons made by <a rel="noopener noreferrer" target="_blank" href={iconlink} title="Freepik">Freepik</a> from <a
                        rel="noopener noreferrer" target="_blank" href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is
                        licensed by <a rel="noopener noreferrer" href="http://creativecommons.org/licenses/by/3.0/"
                        title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
                    </li>
                </ul>
            </div>

        </>;
    }
}

export default FooterCredits;