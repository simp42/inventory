export default class StockRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    getOwnerFilter(userId) {
        return userId ? {user_id: userId} : {};
    }

    async countAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            return await this.db.collection('stock').count(filter);
        } catch (e) {
            console.error(e);
        }

        return 0;
    }

    async countCountedStock(userId) {
        try {
            const filter = {
                ...this.getOwnerFilter(userId),
                counted: {$ne:null}
            };

            return await this.db.collection('stock').count(filter);
        } catch (e) {
            console.error(e);
        }

        return 0;
    }

    async getAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            const stock = await this.db.collection('stock').find(filter, {limit: 1000});
            return stock.toArray();

        } catch (e) {
            console.error(e);
        }

        return null;
    }

    async recreateStockFromArticlesIterator(userId, articles) {
        let stock = [];
        let article = null;

        // delete old stock data of current user
        const stockCollection = this.db.collection('stock');
        try {
            await stockCollection.deleteMany({user_id: userId});
        } catch (e) {
            alert(e);
            return false;
        }

        while((article = await articles.next()) !== undefined) {
            const newStock = {
                ...article,
                article_id: article._id,
                user_id: userId,
                counted: {},
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
}