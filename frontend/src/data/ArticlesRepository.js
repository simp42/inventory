export default class ArticlesRepository {
    constructor(stitchClient, db) {
        this.stitch = stitchClient;
        this.db = db;
    }

    _articles = 'articles';
    _articlesSchema = 'articles_schema';

    /**
     * Returns a count of all articles in the database
     * @returns {Promise<*>}
     */
    async countArticles() {
        return await this.db.collection(this._articles).count({});
    }

    /**
     * Loads all articles in the collection
     * @returns {Promise<void>}
     */
    async getAllArticles() {
        return await this.db.collection(this._articles).find({}).toArray();
    }

    async getAllArticlesIterator() {
        return await this.db.collection(this._articles).find({}).iterator();
    }

    async saveSchema(schema) {
        try {
            // Save the schema of the insertes articles as row descriptions in a special collection
            const schemaCollection = this.db.collection(this._articlesSchema);

            await schemaCollection.deleteMany({});

            let schemaRows = [];

            for (let i = 0; i < schema.length; i++) {
                const key = schema[i];

                let row = {
                    'key': key,
                    'type': 'text',
                    'order' : i
                };

                if (key.toLowerCase() === 'upc' || key.toLocaleLowerCase() === 'ean') {
                    // Guess type of UPC column based on column name
                    row.type = 'upc';
                }

                schemaRows.push(row);
            }

            await schemaCollection.insertMany(schemaRows);

            // Reload schema from service
            window.articlesSchema = null;
            await this.ensureArticlesSchema();
        } catch (e) {
            alert(e);
        }
    }

    /**
     * Ensures that the article schema has been retrieved and returns it to the caller
     * @returns {Promise<*>}
     */
    async ensureArticlesSchema() {
        if (window.articlesSchema && window.articlesSchema.length > 0) {
            return window.articlesSchema;
        }

        const schema = await this.db.collection(this._articlesSchema).find({}).toArray();
        window.articlesSchema = schema;

        return schema;
    }

    /**
     * Deletes all articles from the collection
     * @returns {Promise<void>}
     */
    async deleteAllArticles() {
        try {
            const collection = this.db.collection(this._articles);

            // Drop old articles collection
            await collection.deleteMany({});
        } catch (e) {
            alert(e);
        }
    }

    /**
     * Inserts new articles into the collection
     * @param articles
     * @returns {Promise<void>}
     */
    async insertArticles(articles) {
        try {
            const collection = this.db.collection(this._articles);

            // Insert new articles
            await collection.insertMany(articles);
        } catch (e) {
            alert(e);
        }
    }

    /**
     * Replaces all articles in the database witht he given set of new articles
     * @param articles
     * @returns {Promise<void>}
     */
    async replaceAll(articles) {
        try {
            const collection = this.db.collection(this._articles);

            // Drop old articles collection
            await collection.deleteMany({});

            // Insert new articles
            await collection.insertMany(articles);
        } catch (e) {
            alert(e);
        }
    }
}