import * as Realm from "realm-web";

export default class ArticlesRepository {
    private readonly app: Realm.App;
    private readonly db?: globalThis.Realm.Services.MongoDBDatabase;

    constructor(app: Realm.App, serviceName: string, databaseName: string) {
        this.app = app;
        this.db = this.app.currentUser?.mongoClient(serviceName).db(databaseName);
    }

    private _articles = 'articles';
    private _articlesSchema = 'articles_schema';

    async countArticles(): Promise<number> {
        return await this.db!.collection(this._articles).count({});
    }

    async getAllArticles(): Promise<any> {
        return await this.db!.collection(this._articles).find({});
    }

    async saveSchema(schema: any): Promise<void> {
        try {
            // Save the schema of the inserted articles as row descriptions in a special collection
            const schemaCollection = this.db!.collection(this._articlesSchema);

            await schemaCollection.deleteMany({});

            let schemaRows = [];

            for (let i = 0; i < schema.length; i++) {
                const key = schema[i];

                let row = {
                    'key': key,
                    'type': 'text',
                    'order': i
                };

                if (key.toLowerCase() === 'upc' || key.toLocaleLowerCase() === 'ean') {
                    // Guess type of UPC column based on column name
                    row.type = 'upc';
                }

                schemaRows.push(row);
            }

            await schemaCollection.insertMany(schemaRows);

            // Reload schema from service
            // @ts-ignore
            window.articlesSchema = null;
            await this.ensureArticlesSchema();
        } catch (e) {
            alert(e);
        }
    }

    async ensureArticlesSchema(): Promise<any[]> {
        // @ts-ignore
        if (window.articlesSchema && window.articlesSchema.length > 0) {
            // @ts-ignore
            return window.articlesSchema;
        }

        // @ts-ignore
        const schema = await this.db!.collection(this._articlesSchema).find({});
        // @ts-ignore
        window.articlesSchema = schema;

        return schema;
    }

    async deleteAllArticles(): Promise<any> {
        try {
            const collection = this.db!.collection(this._articles);

            const allArticles = await collection.find({});

            const submitDeleteBatch = async (batch: any[]) => {
                if (batch.length === 0) {
                    return;
                }

                const ids = batch.map((stock) => stock._id);
                await collection.deleteMany({
                    '_id': {
                        "$in": ids
                    }
                });
            };

            let batch = [];
            for(const stock of allArticles) {
                batch.push(stock);
                if (batch.length >= 50) {
                    await submitDeleteBatch(batch);
                    batch = [];
                }
            }

            await submitDeleteBatch(batch);

        } catch (e) {
            alert(e);
        }
    }

    async insertArticles(articles: any): Promise<any> {
        try {
            const collection = this.db!.collection(this._articles);

            // Insert new articles
            await collection.insertMany(articles);
        } catch (e) {
            alert(e);
        }
    }

    async replaceAll(articles: any[]): Promise<any> {
        try {
            const collection = this.db!.collection(this._articles);

            // Drop old articles collection
            await collection.deleteMany({});

            // Insert new articles
            await collection.insertMany(articles);
        } catch (e) {
            alert(e);
        }
    }
}
