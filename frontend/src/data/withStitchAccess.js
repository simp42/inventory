import React, {Component} from 'react';
import StitchConnectionContext from "./StitchConnectionContext";
import CurrentUser from "./CurrentUser";
import StockRepository from "./StockRepository";
import ArticlesRepository from "./ArticlesRepository";

export const withStitchAccess = (ComposedComponent) => {
    class ComponentWithStitchAccess extends Component {

        render() {
            return (
                <StitchConnectionContext.Consumer>
                    {(context) => {

                        const currentUser = new CurrentUser(context.stitchClient, context.db);
                        const stockRepository = new StockRepository(context.stitchClient, context.db);
                        const articlesRepository = new ArticlesRepository(context.stitchClient, context.db);

                        return <ComposedComponent {...this.props}
                                                  user={currentUser}
                                                  stockRepository={stockRepository}
                                                  articlesRepository={articlesRepository}
                        />
                    }}
                </StitchConnectionContext.Consumer>
            );
        }
    }

    let getDisplayName = function (ComposedComponent) {
        return ComposedComponent.displayName || ComposedComponent.name || 'Component';
    };

    ComponentWithStitchAccess.displayName = `withStitchAccess(${getDisplayName(ComposedComponent)})`;

    return ComponentWithStitchAccess;
};