import { GraphQLError } from "graphql/error/index.js";

export const OpenAIResolvers = {
    Query: {
        ask: async (_, { text, model }: { text: string, model: string }, { dataSources }) => {
            try {
                // Should leverage chat completions instead of basic completions, see https://platform.openai.com/docs/guides/chat/chat-vs-completions
                const completionResponse = await dataSources.openAI.createChatCompletion({
                    model,
                    messages: [
                        /*
                         * The system role sets the context for the ai. Here we instruct it that it knows about
                         * Optimizely and has marketing experience.
                         * see https://platform.openai.com/docs/guides/chat/introduction for more
                         */
                        { role: "system", content: "You are a helpful, knowledgeable Optimizely Inc. virtual assistant" +
                                " with marketing experience. Your goal is to assist users leverage the Optimizely" +
                                " platform in a way that makes them want to continue using their products."},
                        { role: "user", content: text }
                    ],
                });
                const { data = {} } = completionResponse;
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
                        parameters: { text, model},
                        details: error
                    },
                });
            }

        }
    }
}