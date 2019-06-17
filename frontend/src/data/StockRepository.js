import {BSON} from 'mongodb-stitch-browser-sdk';

export default class StockRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    _stock = 'stock';

    getOwnerFilter(userId) {
        return userId ? {user_id: userId} : {};
    }

    /**
     * Counts all the articles in the users stock taking
     * @param userId
     * @returns {Promise<*>}
     */
    async countAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            return await this.db.collection(this._stock).count(filter);
        } catch (e) {
            alert(e);
        }

        return 0;
    }

    /**
     * Counts the number of articles in the users stock that have at least one count
     * @param userId
     * @returns {Promise<*>}
     */
    async countCountedStock(userId) {
        try {
            const filter = {
                ...this.getOwnerFilter(userId),
                'count': {
                    '$gt': 0,
                    '$exists': true
                }
            };
            return await this.db.collection(this._stock).count(filter);
        } catch (e) {
            alert(e);
        }

        return 0;
    }

    /**
     * Returns all articles for the users stock taking
     * @param userId
     * @returns {Promise<*>}
     */
    async getAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            const stock = await this.db.collection(this._stock).find(filter, {limit: 1000});
            return stock.toArray();

        } catch (e) {
            alert(e);
        }

        return null;
    }

    async deleteAllStock(userId) {
        // delete old stock data of current user
        const stockCollection = this.db.collection(this._stock);

        try {
            await stockCollection.deleteMany({user_id: userId});
        } catch (e) {
            alert(e);
        }
    }

    /**
     * Imports the articles from the master data iterator given into the users stock taking collection
     * @param userId
     * @param articles
     * @returns {Promise<boolean>}
     */
    async recreateStockFromArticlesIterator(userId, articles) {
        let stock = [];
        let article = null;
        const stockCollection = this.db.collection(this._stock);

        while ((article = await articles.next()) !== undefined) {
            const newStock = {
                ...article,
                article_id: article._id,
                user_id: userId,
                counted: [],
                count: 0
            };

            // Remove id of article
            delete newStock['_id'];

            stock.push(newStock);
        }

        try {
            const insertResult = await stockCollection.insertMany(stock, {ordered: false});
            return insertResult.insertedIds.length === articles.length;
        } catch (e) {
            alert(e);
            return false;
        }
    }

    /**
     * Searches the articles in the users stock taking operation for a search term in the given schema fields
     * @param userId
     * @param schema
     * @param search
     * @returns {Promise<void>}
     */
    async searchStock(userId, schema, search) {
        let orQuery = [];
        for (let i = 0; i < schema.length; i++) {
            let queryPart = {};

            // for upc type columns we only search the beginning and end
            if (schema[i].type === 'upc') {
                queryPart[schema[i].key] = new RegExp('^' + search, 'i');
                orQuery.push(queryPart);

                queryPart = {};
                queryPart[schema[i].key] = new RegExp(search + '$', 'i');
                orQuery.push(queryPart);
            }
            else {
                queryPart[schema[i].key] = new RegExp(search, 'i');
                orQuery.push(queryPart);
            }
        }

        const query = {
            user_id: userId,
            '$or': orQuery
        };

        try {
            return await this.db.collection(this._stock).find(query).toArray();
        } catch (e) {
            alert(e);
            return [];
        }
    }

    /**
     * Retrieve a single stock entry by its object id
     * @param stockId
     * @returns {Promise<*>}
     */
    async getStockById(stockId) {
        const id = new BSON.ObjectId(stockId);
        try {
            const stockRemote = await this.db.collection(this._stock).find({_id: id});
            const stocks = await stockRemote.toArray();
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

    /**
     * Adds a new count increment (i.e. delta to previous count) to a stock
     * @param stock
     * @returns {Promise<boolean>}
     */
    async addCountToStock(stock, additionalCount) {
        if (! stock._id) {
            console.error('Stock does not have an id');
        }

        const newCount = {
            created_at: new Date(),
            change: additionalCount
        };

        stock.count = parseInt(stock.count) + parseInt(additionalCount);
        stock.counted.push(newCount);

        try {
            const collection = this.db.collection(this._stock);
            const updateResult = await collection.updateOne(
                {_id: stock._id},
                stock
            );
            return updateResult.modifiedCount === 1;
        }
        catch (e) {
            alert(e);
        }

        return false;
    }
}