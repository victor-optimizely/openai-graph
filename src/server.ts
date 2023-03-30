import * as dotenv from 'dotenv'
dotenv.config()
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./schema/types/typeDefs.js";
import { resolvers } from "./schema/resolvers/resolvers.js";
import { OpenAIAPI } from './data_sources/OpenAIAPI.js';


interface ContextValue {
  dataSources: {
    openAIApi: OpenAIAPI;
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
  listen: { port: 8080 },
  context: async () => {
    return {
      dataSources: {
        openAIApi: new OpenAIAPI()
      }
    }
  }
});


console.log(`🚀  Server ready at: ${url}`);