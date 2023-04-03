import * as dotenv from 'dotenv'
dotenv.config();

import { PineconeClient } from "@pinecone-database/pinecone";
import { v4 as uuid } from 'uuid';

export const pinecone = new PineconeClient();
await pinecone.init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API_KEY,
});

export const upsert = async (data) => {
    const index = pinecone.Index(process.env.PINECONE_NAMESPACE);
    const { content, content_tokens, embedding } = data;

    const upsertRequest = {
        vectors: [
            {
                id: uuid(),
                values: embedding,
                metadata: {
                    content,
                    content_tokens
                }
            }
        ]
    }
    try {
        const upsertResponse = await index.upsert({ upsertRequest });
        return upsertResponse;
    } catch (err) {
        return err
    }
};

export const query = async (pinecone, embed) => {
    const index = pinecone.Index(process.env.PINECONE_NAMESPACE);
    const queryRequest = {
        vector: embed,
        topK: 10,
        includeValues: false,
        includeMetadata: true
    }
    try {
        const response = await index.query({ queryRequest });
        return { data: response }
    } catch (err) {
        return { error: err }
    }
};
