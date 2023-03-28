export const EchoResolvers = {
    Query: {
        echo: (_, { text }: { text: string }) => {
            return `ECHOOOO ${text}`;
        }
    }
}