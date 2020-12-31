import * as BSON from "bson";

export interface ArticleCountChange {
    created_at: Date,
    change: number
}

export interface CountableArticle {
    _id?: BSON.ObjectId,
    article_id: BSON.ObjectID,
    user_id: string,
    user_email: string,
    counted: ArticleCountChange[],
    count: number
}
