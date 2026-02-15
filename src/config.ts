// src/config.ts
// NEVER hardcode API keys or model names anywhere else in the codebase
const config = {
  API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
  MODEL_NAME: import.meta.env.VITE_MODEL_NAME || "claude-sonnet-4-20250514",
  // Auto-detect OpenRouter vs Anthropic based on API key prefix
  API_URL: (import.meta.env.VITE_ANTHROPIC_API_KEY || "").startsWith("sk-or-")
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.anthropic.com/v1/messages",
  MAX_TOKENS: 1024,
  // Check if using OpenRouter
  IS_OPENROUTER: (import.meta.env.VITE_ANTHROPIC_API_KEY || "").startsWith("sk-or-"),
};

export default config;
