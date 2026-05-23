import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPhilosopher, PHILOSOPHERS } from "@/app/lib/philosophers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { philosopherId, messages, mode } = await req.json();

  let systemPrompt: string;

  if (mode === "free") {
    systemPrompt = `You are a philosophical discussion partner drawing on the entire Western and Eastern philosophical tradition. You explore ideas with depth and intellectual honesty, referencing relevant thinkers when appropriate. You are thoughtful, rigorous, and genuinely curious. You do not moralize or preach — you think alongside the user. Keep responses substantive but conversational, 2-4 paragraphs.`;
  } else {
    const philosopher = getPhilosopher(philosopherId);
    if (!philosopher) {
      return new Response(JSON.stringify({ error: "Philosopher not found" }), { status: 404 });
    }
    systemPrompt = philosopher.systemPrompt + "\n\nKeep responses 2-4 paragraphs. Be immersive and stay in character.";
  }

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
