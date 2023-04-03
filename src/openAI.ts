import * as dotenv from 'dotenv'
dotenv.config();

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const openAI = new OpenAIApi(configuration);

export const createEmbedding = async (openAI, input) => {
    const embeddingRes = await openAI.createEmbedding({
        model: 'text-embedding-ada-002',
        input
    });

    const [{ embedding }] = embeddingRes.data.data;
    return embedding
};

export const createChatCompletion = async (openAI, model, customKnowledge, text) => {
    // Should leverage chat completions instead of basic completions, see https://platform.openai.com/docs/guides/chat/chat-vs-completions
    const completionResponse = await openAI.createChatCompletion({
        model,
        messages: [
            /*
             * The system role sets the context for the ai. Here we instruct it that it knows about
             * Optimizely and has marketing experience.
             * see https://platform.openai.com/docs/guides/chat/introduction for more
             */
            {
                role: "system",
                content: `You are a helpful, knowledgeable Optimizely Inc. virtual assistant with marketing experience. 
                Your goal is to assist users leverage the Optimizely platform in a way that makes them want to continue 
                using their products. ${customKnowledge}`
            },
            { role: "user", content: text }
        ],
    });

    const { data = {} } = completionResponse;
    return data;
};
