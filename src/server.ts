import * as dotenv from 'dotenv'
dotenv.config();

import { OpenAIApi } from "openai";
import { openAI } from './openAI.js';

import { PineconeClient } from "@pinecone-database/pinecone";
import { pinecone } from './pinecone.js';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

import { typeDefs } from "./schema/types/typeDefs.js";
import { resolvers } from "./schema/resolvers/resolvers.js";


if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY) {
  throw new Error('Invalid Configuration. Env variables missing!');
}

interface ContextValue {
  dataSources: {
    openAI: OpenAIApi
    pinecone: PineconeClient
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
  listen: { port: process.env.PORT as any || 8000 },
  context: async () => {
    return {
      dataSources: {
        openAI,
        pinecone,
      }
    }
  }
});


console.log(`🚀  Server ready at: ${url}`);