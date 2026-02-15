# Mind Mirror

An AI-powered writing companion that helps you overcome writer's block through deep, reflective questioning.

## About

Mind Mirror uses conversational AI to guide writers through their creative blocks. Choose from three different personas, each with their own questioning style, to help you think deeper about your writing project.

## Features

- **Three AI Personas**: Sage (reflective), Rational Employee (direct), and Detective (curious)
- **Structured Intake**: Provide context about your writing project before starting
- **Adaptive Questioning**: AI progresses from general to deeper ideas based on your conversation
- **Voice Input**: Use speech-to-text for natural conversation
- **Session Summary**: Generate a summary of your conversation insights
- **Mind Map**: Visualize the themes and ideas explored during your session

## Technologies

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **ReactFlow** - Mind map visualization
- **OpenRouter/Anthropic API** - AI conversation backend

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- OpenRouter or Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Harini-UW/Mind-Mirror.git

# Navigate to project directory
cd Mind-Mirror

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API key to .env
# For OpenRouter: VITE_ANTHROPIC_API_KEY=sk-or-v1-...
# For Anthropic: VITE_ANTHROPIC_API_KEY=sk-ant-...

# Start development server
npm run dev
```

### Configuration

The app auto-detects your API provider based on the key prefix:
- OpenRouter keys start with `sk-or-`
- Anthropic keys start with `sk-ant-`

You can also configure the model in `.env`:
```
VITE_MODEL_NAME=openrouter/aurora-alpha
```

## Usage

1. Select a persona that matches your preferred questioning style
2. Fill out the intake form with details about your writing project
3. Have a conversation - the AI will ask progressively deeper questions
4. Use the controls to redirect, pause, or flag repetitive questions
5. Generate a summary or mind map of your session insights

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
