import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./schema/types/typeDefs.js";
import { resolvers } from "./schema/resolvers/resolvers.js";
import { Configuration, OpenAIApi } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Invalid Configuration. Env variables missing!');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);


interface ContextValue {
  dataSources: {
    openAI: OpenAIApi
  };
}
const server = new ApolloServer<ContextValue>({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 8000 },
  context: async () => {
    return {
      dataSources: {
        openAI
      }
    }
  }
});


console.log(`🚀  Server ready at: ${url}`);