import { defineConfig } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECOMMENDED_MODEL, chooseAgentAction } from './server/agentBrain.js';

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

const fallbackHints = [
  'The seekers see in straight lines. Break sight before you chase the next gem.',
  'A box is more than furniture here; push it into a path and make the search longer.',
  'Raised tiles are quiet islands. Find stairs before you commit to a climb.',
  'The gate is a warning. Count the seconds before the first seeker enters.',
  'The safest route is rarely the shortest one once the seekers have seen you.'
];

function pickHint(state = {}) {
  const salt = `${state.zone || ''}${state.collected || 0}${state.goal || 0}${state.question || ''}`;
  let hash = 0;
  for (let i = 0; i < salt.length; i += 1) hash = (hash * 31 + salt.charCodeAt(i)) >>> 0;
  return fallbackHints[hash % fallbackHints.length];
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function companionPlugin() {
  return {
    name: 'seeker-labyrinth-companion',
    configureServer(server) {
      server.middlewares.use('/api/save-layout', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const layout = await readBody(req);
          if (!Array.isArray(layout.cells) || layout.cells.length === 0 || !Number.isFinite(layout.width) || !Number.isFinite(layout.height)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid layout payload' }));
            return;
          }

          const target = path.join(workspaceRoot, 'src', 'generated-layout.json');
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(
            target,
            `${JSON.stringify({ ...layout, savedAt: new Date().toISOString() }, null, 2)}\n`,
            'utf8'
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, file: 'src/generated-layout.json' }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      server.middlewares.use('/api/companion', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const state = await readBody(req);
          const apiKey = process.env.OPENAI_API_KEY;

          if (!apiKey) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: pickHint(state), source: 'local' }));
            return;
          }

          const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || RECOMMENDED_MODEL,
              max_output_tokens: 90,
              input: [
                {
                  role: 'system',
                  content:
                    'You are a concise in-game companion for an isometric hide-and-seek game called TheSeekerLabyrinth. Give short tactical hints. Never reveal exact coordinates.'
                },
                {
                  role: 'user',
                  content: JSON.stringify({
                    zone: state.zone,
                    collected: state.collected,
                    goal: state.goal,
                    swimming: state.swimming,
                    question: state.question
                  })
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI request failed with ${response.status}`);
          }

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text: data.output_text || pickHint(state), source: 'openai' }));
        } catch (error) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ text: pickHint(), source: 'local', error: error.message }));
        }
      });

      server.middlewares.use('/api/agent-brain', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const body = await readBody(req);
          const action = await chooseAgentAction(body, process.env);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(action));
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ action: 'ease_game', message: 'Rover fallback engaged.' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [companionPlugin()],
  optimizeDeps: {
    entries: ['index.html']
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/');
          if (!normalizedId.includes('/node_modules/')) return undefined;
          if (normalizedId.includes('/node_modules/three/examples/')) return 'three-addons';
          if (normalizedId.includes('/node_modules/three/')) return 'three-core';
          return 'vendor';
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
