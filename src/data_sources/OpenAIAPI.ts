import { RESTDataSource, AugmentedRequest } from '@apollo/datasource-rest';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

export class OpenAIAPI extends RESTDataSource {
    override baseURL = "https://api.openai.com/";

    override willSendRequest(_path: string, request: AugmentedRequest) {
        request.headers["authorization"] = `Bearer ${process.env.OPENAI_API_KEY}`;
        request.headers["content-type"] = "application/json";
    }

    async getGPTResponse(text: string): Promise<string> {
        const completion = await this.post("v1/chat/completions", {
            body: {
                "model": "gpt-3.5-turbo",
                "messages": [{ "role": "user", "content": text }],
                "temperature": 0.6
            }
        });

        return completion.choices[0].message.content;
    }
}