import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Mode = "problem" | "hint" | "review" | "optimal" | "chat";

type ChatBody = {
  messages?: UIMessage[];
  problem?: {
    title: string;
    platform: string;
    platformId?: string;
    difficulty: string;
    topic: string;
    strategy: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  mode?: Mode;
  userCode?: string;
  language?: string;
};

function systemPrompt(mode: Mode, body: ChatBody) {
  const p = body.problem;
  const ctx = p
    ? `\n\nPROBLEM CONTEXT\n- Title: ${p.title}\n- Platform: ${p.platform} ${p.platformId ?? ""}\n- Difficulty: ${p.difficulty}\n- Topic: ${p.topic}\n- Recommended strategy: ${p.strategy}\n- Target time complexity: ${p.timeComplexity}\n- Target space complexity: ${p.spaceComplexity}`
    : "";

  const base = `You are a friendly, patient DSA tutor. Always explain like the student is new to programming. Use simple language, short sentences, real-world analogies. Use markdown.

When showing tree/graph/flow diagrams, ALWAYS use mermaid code blocks like:
\`\`\`mermaid
graph TD
  A[Start] --> B{Check}
  B -->|yes| C[Do it]
  B -->|no| D[Skip]
\`\`\`
Prefer mermaid for: trees, linked lists, graphs, flowcharts, recursion trees, decision flows.
Use markdown tables for dry-runs / iteration traces.

Always explain Big-O time AND space at the end in a small section called "Complexity in simple words" — define what n means here, why it's that complexity, and compare to brute force.${ctx}`;

  switch (mode) {
    case "problem":
      return `${base}

TASK: Output the FULL problem statement for the problem in PROBLEM CONTEXT, as it appears (or would appear) on ${p?.platform ?? "the platform"}. Structure:
## Problem
(clear restatement, 2-4 sentences)
## Examples
At least 2 examples with **Input**, **Output**, **Explanation**.
## Constraints
Bullet list.
## Edge cases to watch
3-5 bullets.

DO NOT solve it. DO NOT hint at the approach. End there.`;

    case "hint":
      return `${base}

TASK: Give a small ladder of hints (3 levels) for the problem. NEVER give the full solution or code. Format:
### Hint 1 — How to think
(reframe the problem, what to notice)
### Hint 2 — Pattern to use
(name the pattern/data structure, why it fits)
### Hint 3 — Plan
(plain-English step-by-step plan, no code)

Then add a "Plan-first checklist" — 4-6 questions the student should answer on paper before coding.`;

    case "review": {
      const codeBlock = body.userCode
        ? `\n\nSTUDENT SUBMISSION (${body.language ?? "code"}):\n\`\`\`${body.language ?? ""}\n${body.userCode}\n\`\`\``
        : "";
      return `${base}${codeBlock}

TASK: Review the student's submission. Be encouraging but honest. Format:
## Verdict
One of: ✅ Correct & optimal | 🟡 Correct but can be better | ❌ Has bugs
## What works
Bullet list.
## Issues
For each bug or inefficiency: explain WHY it's wrong, walk through a failing example with a markdown table dry-run.
## Your complexity
Time and space of THEIR code, simply.
## Suggestions to fix (no full solution yet)
Bullet hints they can apply themselves.

Do NOT paste a full optimal solution here. The student can ask for the optimal solution separately.`;
    }

    case "optimal": {
      const codeBlock = body.userCode
        ? `\n\nSTUDENT'S LAST CODE:\n\`\`\`${body.language ?? ""}\n${body.userCode}\n\`\`\``
        : "";
      return `${base}${codeBlock}

TASK: Teach the OPTIMAL solution. Format:
## Intuition (simple)
Plain-English analogy.
## Data structure used
Name it and WHY it fits (one paragraph).
## Visual
A mermaid diagram (tree, graph, flow, or recursion tree) that shows how the algorithm flows.
## Step-by-step plan
Numbered list, plain English.
## Iteration / dry-run
A markdown table showing the state at each step on a small example.
## Optimal code
\`\`\`${body.language ?? "javascript"}
// well-commented optimal solution
\`\`\`
## Complexity in simple words
Time + space, with the n defined, plus comparison to brute force.
## Common pitfalls
3-4 bullets.`;
    }

    default:
      return `${base}

The student may ask any follow-up about this problem, the data structure, or complexity. Keep answers short and use diagrams/tables when helpful.`;
  }
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = body.messages ?? [];
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const mode: Mode = body.mode ?? "chat";

        const result = streamText({
          model,
          system: systemPrompt(mode, body),
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});