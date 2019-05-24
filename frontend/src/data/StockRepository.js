export default class StockRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    async getAllStock() {
        try {
            const stock = this.db.collection('stock')
                .find({}, {limit: 1000})
                .toArray();
            return stock;

        } catch (e) {
            console.err(e);
        }

        return null;
    }
}