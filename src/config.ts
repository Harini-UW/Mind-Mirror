// settings file for talking to ai
// keep all secrets here only
const config = {
  // get secret key from safe place
  API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
  // which ai brain to use
  MODEL_NAME: import.meta.env.VITE_MODEL_NAME || "claude-sonnet-4-20250514",
  // figure out which ai service automatically
  API_URL: (import.meta.env.VITE_ANTHROPIC_API_KEY || "").startsWith("sk-or-")
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.anthropic.com/v1/messages",
  // how many words ai can say
  MAX_TOKENS: 1024,
  // check if using openrouter service
  IS_OPENROUTER: (import.meta.env.VITE_ANTHROPIC_API_KEY || "").startsWith("sk-or-"),
};

// let other files use these settings
export default config;
