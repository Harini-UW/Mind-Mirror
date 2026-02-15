import config from "@/config";
import { personas, PersonaId } from "@/lib/personas";

export type Msg = { role: "user" | "assistant"; content: string };

function getDifficultyLevel(exchangeCount: number): string {
  if (exchangeCount <= 5) {
    return "GENERAL IDEAS — Ask broad questions about purpose, audience, structure, and core content";
  }
  return "DEEPER IDEAS — Ask specific questions about details, connections, gaps, and refinements";
}

function extractTopics(messages: Msg[]): string[] {
  return messages
    .filter((m) => m.role === "assistant")
    .map((m, idx) => {
      // Extract the main topic from each question
      const question = m.content;
      // Simple heuristic: get the key phrase (nouns/topics mentioned)
      return `- Question ${idx + 1}: Asked about "${question.slice(0, 60)}..."`;
    });
}

function buildSystemPrompt(
  personaId: string,
  messages: Msg[],
  flags?: { dontRepeat?: boolean; redirect?: boolean }
): string {
  const persona = personas[personaId as PersonaId];
  if (!persona) return "";

  let systemPrompt = persona.systemPrompt;

  const coveredTopics = extractTopics(messages);
  if (coveredTopics.length > 0) {
    systemPrompt += `\n\nANGLES ALREADY EXPLORED (DO NOT REVISIT):\n${coveredTopics.join("\n")}`;
  }

  const exchangeCount = messages.filter((m) => m.role === "user").length;
  const difficulty = getDifficultyLevel(exchangeCount);
  systemPrompt += `\n\nCURRENT DIFFICULTY LEVEL: ${difficulty}. Adjust your questioning depth accordingly.`;

  if (flags?.dontRepeat) {
    systemPrompt += `\n\nURGENT: The user has flagged that your questions feel repetitive. Review the conversation carefully and ensure your next question explores a COMPLETELY NEW angle that has not been touched at all. Acknowledge briefly that you're shifting direction.`;
  }

  if (flags?.redirect) {
    systemPrompt += `\n\nThe user wants you to change your line of questioning. Shift to a meaningfully different angle or dimension of their writer's block. Do NOT continue the current thread. Start fresh from a new direction.`;
  }

  return systemPrompt;
}

export async function streamChat({
  messages,
  persona,
  onDelta,
  onDone,
  onError,
  flags,
}: {
  messages: Msg[];
  persona: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  flags?: { dontRepeat?: boolean; redirect?: boolean };
}) {
  if (!config.API_KEY) {
    onError("API key not configured. Please set VITE_ANTHROPIC_API_KEY in your .env file.");
    return;
  }

  const systemPrompt = buildSystemPrompt(persona, messages, flags);

  try {
    // Build headers based on provider
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (config.IS_OPENROUTER) {
      headers["Authorization"] = `Bearer ${config.API_KEY}`;
      headers["HTTP-Referer"] = window.location.origin;
      headers["X-Title"] = "Mind Mirror";
    } else {
      headers["x-api-key"] = config.API_KEY;
      headers["anthropic-version"] = "2023-06-01";
    }

    // Build request body based on provider
    const requestBody = config.IS_OPENROUTER
      ? {
          model: config.MODEL_NAME,
          max_tokens: config.MAX_TOKENS,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }
      : {
          model: config.MODEL_NAME,
          max_tokens: config.MAX_TOKENS,
          system: systemPrompt,
          stream: true,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        };

    const resp = await fetch(config.API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (resp.status === 429) {
      onError("Rate limit exceeded. Please wait a moment and try again.");
      return;
    }
    if (!resp.ok || !resp.body) {
      const errorBody = await resp.text().catch(() => "");
      onError(`API error (${resp.status}): ${errorBody || "Failed to connect to AI."}`);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (line.startsWith("event: ")) continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);

          // Handle both OpenRouter (OpenAI format) and Anthropic formats
          let content: string | undefined;

          if (config.IS_OPENROUTER) {
            // OpenRouter/OpenAI format: choices[0].delta.content
            content = parsed.choices?.[0]?.delta?.content;
          } else {
            // Anthropic format: content_block_delta events
            if (parsed.type === "content_block_delta") {
              content = parsed.delta?.text;
            }
          }

          if (content) {
            onDelta(content);
          }
        } catch {
          // Incomplete JSON, put it back
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Unknown error");
  }
}

export async function generateSummary(messages: Msg[]): Promise<{
  startingPoint: string;
  assumptions: string[];
  endResult: string;
}> {
  const summaryPrompt = `Based on this conversation about writing, generate a structured summary.

CRITICAL: You MUST respond with ONLY valid JSON. No explanation, no markdown, no code blocks. Just pure JSON.

Format:
{
  "startingPoint": "What the user initially described about their writing project (1-2 sentences)",
  "assumptions": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "endResult": "Where the conversation led them (1-2 sentences)"
}

Respond with ONLY the JSON object, nothing else.`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.IS_OPENROUTER) {
    headers["Authorization"] = `Bearer ${config.API_KEY}`;
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "Mind Mirror";
  } else {
    headers["x-api-key"] = config.API_KEY;
    headers["anthropic-version"] = "2023-06-01";
  }

  const requestBody = config.IS_OPENROUTER
    ? {
        model: config.MODEL_NAME,
        max_tokens: config.MAX_TOKENS,
        messages: [
          { role: "system", content: summaryPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }
    : {
        model: config.MODEL_NAME,
        max_tokens: config.MAX_TOKENS,
        system: summaryPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };

  const resp = await fetch(config.API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`API error (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();

  // Extract response based on provider
  const responseText = config.IS_OPENROUTER
    ? data.choices?.[0]?.message?.content
    : data.content?.[0]?.text;

  if (!responseText) {
    console.error("Summary API response:", data);
    throw new Error("No content in API response");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = responseText.trim();

  // Remove markdown code block if present
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  // Remove any leading/trailing non-JSON text
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!parsed.startingPoint || !parsed.assumptions || !parsed.endResult) {
      throw new Error("Invalid summary structure");
    }

    return parsed;
  } catch (parseError) {
    console.error("Failed to parse summary JSON:", responseText);
    console.error("Extracted JSON:", jsonText);
    throw new Error("AI returned invalid JSON format. Please try again.");
  }
}

export async function generateMindMapData(messages: Msg[]): Promise<{
  rootNode: { label: string; id: string };
  branches: Array<{
    id: string;
    label: string;
    parentId: string;
    type: string;
    children: Array<{
      id: string;
      label: string;
      parentId: string;
      type: string;
      messageIndex?: number;
    }>;
  }>;
}> {
  const mapPrompt = `Analyze this conversation about writing and generate a mind map structure.

CRITICAL: You MUST respond with ONLY valid JSON. No explanation, no markdown, no code blocks. Just pure JSON.

Format:
{
  "rootNode": { "label": "User's writing project topic", "id": "root" },
  "branches": [
    {
      "id": "branch-1",
      "label": "Main theme or question explored",
      "parentId": "root",
      "type": "theme",
      "children": [
        { "id": "leaf-1", "label": "Specific insight or detail discussed", "parentId": "branch-1", "type": "insight" }
      ]
    }
  ]
}

Create 3-5 main branches representing key themes discussed. Each branch should have 1-3 children representing specific insights.
Keep labels concise (under 50 characters).

Respond with ONLY the JSON object, nothing else.`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.IS_OPENROUTER) {
    headers["Authorization"] = `Bearer ${config.API_KEY}`;
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-Title"] = "Mind Mirror";
  } else {
    headers["x-api-key"] = config.API_KEY;
    headers["anthropic-version"] = "2023-06-01";
  }

  const requestBody = config.IS_OPENROUTER
    ? {
        model: config.MODEL_NAME,
        max_tokens: config.MAX_TOKENS,
        messages: [
          { role: "system", content: mapPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }
    : {
        model: config.MODEL_NAME,
        max_tokens: config.MAX_TOKENS,
        system: mapPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };

  console.log("Mind map generation: Calling API...");
  const resp = await fetch(config.API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  console.log("Mind map generation: API responded with status", resp.status);

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error("Mind map API error:", resp.status, errorText);
    throw new Error(`API error (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();
  console.log("Mind map generation: Parsed API response", data);

  // Extract response based on provider
  const responseText = config.IS_OPENROUTER
    ? data.choices?.[0]?.message?.content
    : data.content?.[0]?.text;

  console.log("Mind map generation: Extracted response text:", responseText?.substring(0, 200) + "...");

  if (!responseText) {
    console.error("Mind map API response:", data);
    throw new Error("No content in API response");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = responseText.trim();

  // Remove markdown code block if present
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    console.log("Mind map generation: Found markdown code block, extracting...");
    jsonText = codeBlockMatch[1].trim();
  }

  // Remove any leading/trailing non-JSON text
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    console.log("Mind map generation: Extracting JSON object from text...");
    jsonText = jsonMatch[0];
  }

  console.log("Mind map generation: Final JSON text to parse:", jsonText.substring(0, 200) + "...");

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonText);
    console.log("Mind map generation: Successfully parsed JSON");

    // Validate structure
    if (!parsed.rootNode || !parsed.branches || !Array.isArray(parsed.branches)) {
      console.error("Mind map generation: Invalid structure:", parsed);
      throw new Error("Invalid mind map structure: missing rootNode or branches");
    }

    console.log("Mind map generation: Structure validated, returning data");
    return parsed;
  } catch (parseError) {
    console.error("Mind map generation: Failed to parse JSON");
    console.error("Response text:", responseText);
    console.error("Extracted JSON:", jsonText);
    console.error("Parse error:", parseError);
    throw new Error(`AI returned invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
}
