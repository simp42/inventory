import React, {Component} from 'react';
import CurrentUser from "./CurrentUser";
import StockRepository from "./StockRepository";
import ArticlesRepository from "./ArticlesRepository";
import {Subtract} from "utility-types";
import {MongoConnectionContextInterface, MongoConnectionContextConsumer} from "./MongoConnectionContext";

export interface WithMongoAccessProps {
    user: CurrentUser | null,
    stockRepository: StockRepository | null,
    articlesRepository: ArticlesRepository | null
}

export interface WithMongoAccessState {
}

export const WithMongoAccess = <T extends WithMongoAccessProps>(WrappedComponent: React.ComponentType<T>) => {
    const wrappedComponentDisplayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return class WithMongoAccess extends React.Component<Subtract<T, WithMongoAccessProps>, WithMongoAccessState> {
        static displayName: string = `WithMongoAccess(${wrappedComponentDisplayName})`;
        state: WithMongoAccessState = {};

        render() {
            const service:string = process.env.REACT_APP_MONGODB_CLUSTER || '';
            const database:string = process.env.REACT_APP_MONGODB_DATABASE || '';

            return <MongoConnectionContextConsumer>
                {(context: MongoConnectionContextInterface) => {

                    const currentUser = new CurrentUser(context.realm!);
                    const stockRepository = new StockRepository(context.realm!, service, database);
                    const articlesRepository = new ArticlesRepository(context.realm!, service, database);

                    return <WrappedComponent {...this.props as T}
                                             user={currentUser}
                                             stockRepository={stockRepository}
                                             articlesRepository={articlesRepository}
                    />
                }}
            </MongoConnectionContextConsumer>
        }
    }
};
