export default class StockRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    getOwnerFilter(userId) {
        return userId ? {owner_id: userId} : {};
    }

    async countAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            const stock = await this.db.collection('stock').count(filter);
            return stock;
        } catch (e) {
            console.err(e);
        }

        return 0;
    }

    async getAllStock(userId) {
        try {
            const filter = this.getOwnerFilter(userId);

            const stock = await this.db.collection('stock').find(filter, {limit: 1000});
            return stock.toArray();

        } catch (e) {
            console.err(e);
        }

        return null;
    }
}