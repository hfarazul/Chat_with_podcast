import { NextResponse } from 'next/server'
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockRuntime = new BedrockRuntimeClient({
  region: "us-east-1", // replace with your preferred region
});

async function chatWithClaude(userMessage: string) {
  const params = {
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
    })
  };

  try {
    const command = new InvokeModelCommand(params);
    const response = await bedrockRuntime.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error('Error in chatWithClaude:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { transcript, question } = await req.json();

    const prompt = `Here's a transcript of a podcast: ${transcript}\n\nQuestion: ${question}`;

    const answer = await chatWithClaude(prompt);

    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing your request.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
