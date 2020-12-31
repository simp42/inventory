import * as BSON from "bson";
import * as Realm from "realm-web";
import {Article} from "./Article";
import {ArticleCountChange, CountableArticle} from "./CountableArticle";

export default class StockRepository {
    private readonly app: Realm.App;
    private readonly service: string;
    private readonly database: string;
    private readonly db?: globalThis.Realm.Services.MongoDBDatabase;

    constructor(app: Realm.App, service: string, database: string) {
        this.app = app;
        this.service = service;
        this.database = database;
        this.db = app.currentUser?.mongoClient(service).db(database);
    }

    private _stock = 'stock';

    getOwnerFilter(userId: string): any {
        return userId ? {user_id: userId} : {};
    }

    async countAllStock(userId: string): Promise<number> {
        try {
            const filter = this.getOwnerFilter(userId);

            return await this.db!.collection(this._stock).count(filter);
        } catch (e) {
            alert(e);
        }

        return 0;
    }

    async countCountedStock(userId: string): Promise<number> {
        try {
            const filter = {
                ...this.getOwnerFilter(userId),
                'count': {
                    '$gt': 0,
                    '$exists': true
                }
            };
            return await this.db!.collection(this._stock).count(filter);
        } catch (e) {
            alert(e);
        }

        return 0;
    }

    async getAllStock(userId: string): Promise<CountableArticle[] | null> {
        try {
            const filter = this.getOwnerFilter(userId);

            return await this.db!.collection(this._stock).find(filter);
        } catch (e) {
            alert(e);
        }

        return null;
    }

    async deleteAllStock(userId: string, updateUi:(removed: number) => void): Promise<any> {
        const stocksCollection = this.db!.collection(this._stock);
        const allStocks = await stocksCollection.find(this.getOwnerFilter(userId));

        const submitDeleteBatch = async (batch: any[]) => {
            if (batch.length === 0) {
                return;
            }

            const ids = batch.map((stock) => stock._id);
            await stocksCollection.deleteMany({
                '_id': {
                    "$in": ids
                }
            });
            await updateUi(batch.length);
        };

        let batch = [];
        for(const stock of allStocks) {
            batch.push(stock);
            if (batch.length >= 50) {
                await submitDeleteBatch(batch);
                batch = [];
            }
        }

        await submitDeleteBatch(batch);
    }

    async recreateStockFromArticles(userId: string, userEmail: string, articles: Article[]): Promise<boolean> {
        let stock = [];
        const stockCollection = this.db!.collection(this._stock);

        for (const article of articles) {
            const newStock: CountableArticle = {
                ...article,
                article_id: article._id,
                user_id: userId,
                user_email: userEmail,
                counted: [],
                count: 0
            };

            // Remove id of article
            delete newStock._id;

            stock.push(newStock);
        }

        try {
            const insertResult = await stockCollection.insertMany(stock);
            return insertResult.insertedIds.length === articles.length;
        } catch (e) {
            alert(e);
            return false;
        }
    }

    async searchStock(userId: string, schema: any, search: any): Promise<CountableArticle[]> {
        let orQuery = [];
        for (let i = 0; i < schema.length; i++) {
            let queryPart: any = {};

            // for upc type columns we only search the beginning and end
            if (schema[i].type === 'upc') {
                queryPart[schema[i].key] = new RegExp('^' + search, 'i');
                orQuery.push(queryPart);

                queryPart = {};
                queryPart[schema[i].key] = new RegExp(search + '$', 'i');
                orQuery.push(queryPart);
            } else {
                queryPart[schema[i].key] = new RegExp(search, 'i');
                orQuery.push(queryPart);
            }
        }

        const query = {
            user_id: userId,
            '$or': orQuery
        };

        try {
            return await this.db!.collection(this._stock).find(query);
        } catch (e) {
            alert(e);
            return [];
        }
    }

    async getStockById(stockId: string): Promise<CountableArticle | null> {
        const id = new BSON.ObjectId(stockId);
        try {
            const stockRemote = await this.db!.collection(this._stock).find({_id: id});
            const stocks = await stockRemote;
            if (stocks.length === 0) {
                console.error('Stock not found');
                return null;
            }

            if (stocks.length > 1) {
                console.error('More than one stock entry with id ' + stockId + ' found!?!');
                return null;
            }

            return stocks[0];
        } catch (e) {
            alert(e);
        }

        return null;
    }

    async addCountToStock(stock: CountableArticle, additionalCount: number): Promise<boolean> {
        if (!stock._id) {
            console.error('Stock does not have an id');
        }

        const newCount: ArticleCountChange = {
            created_at: new Date(),
            change: additionalCount
        };

        stock.count = stock.count + additionalCount;
        stock.counted.push(newCount);

        try {
            const collection = this.db!.collection(this._stock);
            const updateResult = await collection.updateOne(
                {_id: stock._id},
                stock
            );
            return updateResult.modifiedCount === 1;
        } catch (e) {
            alert(e);
        }

        return false;
    }
}
