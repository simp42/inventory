import React from "react";
import * as Realm from "realm-web";

export interface MongoConnectionContextInterface {
    realm: Realm.App | null
}

const context = React.createContext<MongoConnectionContextInterface>({
    realm: null
});

export const MongoConnectionContextProvider = context.Provider;
export const MongoConnectionContextConsumer = context.Consumer;
