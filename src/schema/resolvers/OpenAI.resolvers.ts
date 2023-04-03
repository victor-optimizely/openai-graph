import { GraphQLError } from "graphql/error/index.js";
import { createChatCompletion, createEmbedding } from "../../openAI.js";
import { query } from "../../pinecone.js";

export const OpenAIResolvers = {
    Query: {
        ask: async (_, { text, model }: { text: string, model: string }, { dataSources }) => {
            const { openAI, pinecone } = dataSources;
            try {
                const embedding = await createEmbedding(openAI, text);
                const queryResponse = await query(pinecone, embedding);
                const customKnowledgeContext = queryResponse.data.matches.reduce((addContext, data) => addContext + data.metadata.content, "");
                const data = await createChatCompletion(openAI, model, customKnowledgeContext, text);
                
                const { choices = [], created, id, usage = {} } = data;
                const { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total } = usage;
                const [{ message = {}, finish_reason: status }] = choices;
                const { content: response } = message;
                const tokens = {
                    completion,
                    prompt,
                    total
                };

                return {
                    created,
                    id,
                    response,
                    status,
                    tokens
                };
            } catch (error) {
                throw new GraphQLError('Error getting a response.', {
                    extensions: {
                        code: 'OPENAI_ERROR',
                        location: 'Query.ask',
                        parameters: { text, model },
                        details: error
                    },
                });
            }
        },
    },
}