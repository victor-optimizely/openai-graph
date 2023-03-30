export const queries = `
    type Query {
        ask(text: String!, model: String = "gpt-3.5-turbo"): Response
    }
`;