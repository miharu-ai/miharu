# miharu-ai PoC Specification

**miharu-ai** is an LLMOps framework for TypeScript that provides observability for the API usage. 
This PoC validates if the core features work practically.

## Philosophy

* **Zero-config** - One line of code gets you started.

* **Lightweight** - Minimal dependencies and zero overhead.

* **Pluggable** - Extensible architecture that grows with your needs.

## Getting started

```bash
npm install miharu-ai
```

```typescript
import OpenAI from 'openai';
import miharu from 'miharu-ai';

miharu.init();

const apiKey = process.env.OPENAI_API_KEY!
const openai = new OpenAI({ apiKey });
const model = 'gpt-3.5-turbo';
const message = [{ role: 'user', content: 'Hello!' }]

const response = await openai.chat.completions.create({ model, messages });

// Usage automatically saved into local sqlite
```

```bash
npx miharu-ai dashboard 
# -> Opens http://localhost:3001 with usage stats
```

## Requirements

### 1. Interception
- One-liner captures all API calls (OpenAI only for PoC)
- Existing code works unchanged without performance impact
- Bundle size under 10KB with flat memory usage 
### 2. Data Capture
- Accurate cost and token tracking
- API error tracing
### 3. Instant Visualization
- Simple but good-enough dashboard out-of-the-box
### 4. Adaptable architecture
* Adaptable architecture for future improvements
## Approach

### Interception 

Patch `globalThis.fetch` to detect OpenAI API calls

```TypeScript
const originalFetch = globalThis.fetch.bind(globalThis);
```
### Error Boundary

```TypeScript
try { 
  // Parse and log 
} catch (e) { 
  console.error('[miharu-ai] Logging error:', e); 
  // Let the original response through
}
```


### Data Model

```sql
CREATE TABLE llm_calls (
    id TEXT PRIMARY KEY,
    timestamp INTEGER,
    model TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    cost_cents INTEGER,
    duration_ms INTEGER,
    status TEXT
);
```

## Development

### Step 0: Project setup 

Set up the project with minimal packages for TypeScript project.

Confirm "Hello world!" works with `import miharu from 'miharu-ai'; miharu.init();`.

### Step 1: Interception

Build the fetch wrapper that intercepts OpenAI API calls without breaking anything.

Confirm simple OpenAI API call is measures with the following code:

```TypeScript
import OpenAI from 'openai';
import miharu from 'miharu-ai';

miharu.init();

const apiKey = process.env.OPENAI_API_KEY!
const openai = new OpenAI({ apiKey });
const model = 'gpt-3.5-turbo';
const message = [{ role: 'user', content: 'Hello!' }]

const response = await openai.chat.completions.create({ model, messages });

// -> console.log inside monkey-patched function will be shown like:
// Hello, greeting from miharu!
```

### Step 2: Data Capture

Parse OpenAI responses to extract usage data and calculate costs.

**Deliverables:**

- Response parsing for chat completions
- Token counting
- Cost calculation (approximate)
- Error response handling

**Success metric:** Every successful API call generates accurate usage data.

```TypeScript
import OpenAI from 'openai';
import miharu from 'miharu-ai';

miharu.init();

const apiKey = process.env.OPENAI_API_KEY!
const openai = new OpenAI({ apiKey });
const model = 'gpt-3.5-turbo';
const message = [{ role: 'user', content: 'Hello!' }]

const response = await openai.chat.completions.create({ model, messages });

// -> Monkey-patched function logs the API metric like:
// {
//   timestamp: 32339203,
//   model: 'gpt-3.5-turbo',
//   prompt_tokens: 1000,
//   completion_tokens: 200,
//   cost_cents: 0.0000001,
//   duration_ms: 10,
//   status: 'success',
// }
```

### Step 3: Storage 

Save usage data to local SQLite without blocking API responses.

**Deliverables:**

- SQLite schema and operations
- Asynchronous write queue
- Database initialization
- Basic error recovery

**Success metric:** 1000 consecutive API calls generate 1000 database records with no memory leaks.

```TypeScript
import OpenAI from 'openai';
import miharu from 'miharu-ai';

miharu.init();

const apiKey = process.env.OPENAI_API_KEY!
const openai = new OpenAI({ apiKey });
const model = 'gpt-3.5-turbo';
const message = [{ role: 'user', content: 'Hello!' }]

// Try this 1000 times
const response = await openai.chat.completions.create({ model, messages });

// -> Make sure the llm_calls table stores 1000 records without memory leaks.
```

### Step 4: Visualization

Build a simple web dashboard to view usage data.

**Deliverables:**

- HTTP server for dashboard
- HTML template with usage table
- Basic aggregations (total cost, requests/hour)
- CLI command to launch

**Success metric:** `npx miharu-ai dashboard` shows live usage data within 5 seconds.

## Limitations

**Supported:**

- OpenAI chat completions API only
- Node.js 18+ environments
- Basic cost/usage tracking
- Local SQLite storage

**Not supported (yet):**

- Streaming responses
- Function calling
- Image/audio inputs
- Other AI providers
- Other database adapters
- Remote storage
- Multi-user dashboards

## Success Criteria

### Performance Benchmarks

- [ ] API latency increase < 5ms
- [ ] Memory usage stays flat after 100+ calls
- [ ] Bundle size < 10KB compressed
- [ ] Dashboard loads in < 3 seconds

### Reliability Tests

- [ ] 1000 consecutive API calls, zero dropped logs
- [ ] API errors don't crash the app
- [ ] SQLite corruption recovery
- [ ] Works with existing OpenAI SDK patterns

### Developer Experience

- [ ] Zero-config installation and setup
- [ ] Clear documentation with examples
- [ ] Helpful error messages
- [ ] TypeScript support with proper types

## Technical Risks

**Fetch patching conflicts** - Other libraries might also patch fetch. Mitigation: detect and chain existing patches.

**OpenAI SDK changes** - Internal SDK changes could break our parsing. Mitigation: focus on stable API response format.

**Performance overhead** - Monitoring adds latency. Mitigation: async-everything, benchmark continuously.

## Next Steps: MVP

- Streaming responses and Function calling
- Image/audio inputs
- Other AI providers and database adapters
- Wrapper API for detailed tracing
- Rich interactive dashboard UI
