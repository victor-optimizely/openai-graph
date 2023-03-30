export const ResponseType = `
    # Breakdown of api query tokens
    type TokenUsage {
        prompt: Int
        completion: Int
        total: Int
    }
    
    type Response {
        id: String!
        created: Int
        response: String
        tokens: TokenUsage
        completionStatus: String
    }
`