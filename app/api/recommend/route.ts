import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PHILOSOPHERS, recommendForTopic } from "@/app/lib/philosophers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { topic } = await req.json();
  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic required" }, { status: 400 });
  }

  // Keyword-based local recommendation as primary
  const localRecs = recommendForTopic(topic);

  // Use Claude to refine and explain the recommendation
  const philosopherList = PHILOSOPHERS.map(
    (p) => `${p.id}: ${p.name} (${p.era}, ${p.tradition}) — ${p.bio}`
  ).join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `A user wants to explore the philosophical topic: "${topic}"

Here are the available philosophers:
${philosopherList}

Return a JSON object with:
- "recommendations": array of exactly 3 philosopher IDs (from the list above) most relevant to this topic, ordered by relevance
- "reason": one sentence explaining why these philosophers are particularly suited to this topic

Return ONLY valid JSON, no markdown.`,
      },
    ],
  });

  try {
    const text = (response.content[0] as { type: string; text: string }).text;
    const parsed = JSON.parse(text);
    const recommended = (parsed.recommendations as string[])
      .slice(0, 3)
      .map((id: string) => PHILOSOPHERS.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      philosophers: recommended.length >= 2 ? recommended : localRecs,
      reason: parsed.reason ?? "",
    });
  } catch {
    return NextResponse.json({ philosophers: localRecs, reason: "" });
  }
}
