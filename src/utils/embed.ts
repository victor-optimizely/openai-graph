import * as dotenv from 'dotenv'
dotenv.config();

import fs from "fs";
import { encode } from "gpt-3-encoder";
import { upsert } from "../pinecone";
import { createEmbedding, openAI } from "../openAI";

const CHUNK_LIMIT = 200;
const CHUNK_MINIMAL = 100;

const chunkFile = (article) => {
    let fileTextChunks = [];

    if (encode(article).length > CHUNK_LIMIT) {
        const split = article.split(". ");
        let chunkText = "";

        for (let i = 0; i < split.length; i++) {
            const sentence = split[i];
            const sentenceTokenLength = encode(sentence);
            const chunkTextTokenLength = encode(chunkText).length;

            if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_LIMIT) {
                fileTextChunks.push(chunkText);
                chunkText = "";
            }

            if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
                chunkText += sentence + ". ";
            } else {
                chunkText += sentence + " ";
            }
        }

        fileTextChunks.push(chunkText.trim());
    } else {
        fileTextChunks.push(article.trim());
    }

    const fileChunks = fileTextChunks.map((text) => {
        const trimmedText = text.trim();

        const chunk = {
            content: trimmedText,
            content_length: trimmedText.length,
            content_tokens: encode(trimmedText).length,
            embedding: []
        };

        return chunk;
    });

    if (fileChunks.length > 1) {
        for (let i = 0; i < fileChunks.length; i++) {
            const chunk = fileChunks[i];
            const prevChunk = fileChunks[i - 1];

            if (chunk.content_tokens < CHUNK_MINIMAL && prevChunk) {
                prevChunk.content += " " + chunk.content;
                prevChunk.content_length += chunk.content_length;
                prevChunk.content_tokens += chunk.content_tokens;
                fileChunks.splice(i, 1);
                i--;
            }
        }
    }

    const chunkedSection = [
        ...fileChunks
    ];

    return chunkedSection;
};

(async () => {
    const file = await fs.readFileSync('meeting.txt', { encoding: 'utf8' });
    const chunkedFile = await chunkFile(file);

    for (let i = 0; i < chunkedFile.length; i++) {
        const embedding = await createEmbedding(openAI, chunkedFile[i].content);
        const result = await upsert({
            content: chunkedFile[i].content,
            content_tokens: chunkedFile[i].content_tokens,
            embedding
        });
        setTimeout(() => { }, 500)
        console.log("chunking result: ", result);
    }
})()