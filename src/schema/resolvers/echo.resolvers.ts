export const GPTResolvers = {
    Query: {
        chat: async (_, { text }: { text: string }, { dataSources }) => {
            const data = await dataSources.openAIApi.getGPTResponse(text);
            return data;
        }
    }
}