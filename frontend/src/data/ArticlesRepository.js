export default class ArticlesRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    async countArticles() {
        return await this.db.collection('articles').count({});
    }

    async replaceAll(articles) {
        const collection = this.db.collection('articles');

        // Drop old articles collection
        await collection.deleteMany({});

        // Insert new articles
        await collection.insertMany(articles);
    }
}