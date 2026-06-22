const RECOMMENDED_MODEL = 'gpt-5.4-nano';

const ACTIONS = [
  'slow_seekers',
  'stun_seekers',
  'ease_game',
  'ramp_difficulty',
  'focus_seekers',
  'reveal_hint',
  'add_gem',
  'add_seeker'
];

const ACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['action', 'message'],
  properties: {
    action: {
      type: 'string',
      enum: ACTIONS
    },
    message: {
      type: 'string',
      maxLength: 140
    }
  }
};

function clampText(value, maxLength = 700) {
  return String(value || '').slice(0, maxLength);
}

function compactGameState(gameState = {}) {
  return {
    difficulty: clampText(gameState.difficulty, 24),
    gemsCollected: Number(gameState.gemsCollected || 0),
    gemTotal: Number(gameState.gemTotal || 0),
    seekerCount: Number(gameState.seekerCount || 0),
    seekersTarget: Number(gameState.seekersTarget || 0),
    seekerSpeed: Number(gameState.seekerSpeed || 0),
    escapeUnlocked: Boolean(gameState.escapeUnlocked),
    playerCell: gameState.playerCell || null,
    activeEffects: gameState.activeEffects || {}
  };
}

function systemPrompt() {
  return [
    'You are the optional rover companion in TheSeekerLabyrinth.',
    'The game already runs local seeker agents. Your job is to choose one bounded rover tool from the JSON schema.',
    'Use slow_seekers, stun_seekers, or ease_game only when the player asks for help or lower difficulty.',
    'Use ramp_difficulty or focus_seekers only when the player asks for harder play, danger, pressure, or a challenge.',
    'Use reveal_hint when the player asks where to go, where gems are, where the gate is, or asks for a hint.',
    'Use add_gem only when the player asks for more gems, a bonus gem, or a new objective.',
    'Use add_seeker only when the player asks for more seekers, extra pressure, or a more crowded chase.',
    'Return short, diegetic messages. Never include coordinates, secrets, markdown, or extra keys.'
  ].join(' ');
}

function fallbackAction(prompt = '') {
  const text = prompt.toLowerCase();
  if (/more gems?|extra gems?|add (a )?gem|spawn (a )?gem|another gem|new gem/.test(text)) {
    return { action: 'add_gem', message: 'Bonus gem deployed. Score adjusted for rover help.' };
  }
  if (/more seekers?|extra seekers?|add (a )?seeker|spawn (a )?seeker|send seekers?|summon seekers?/.test(text)) {
    return { action: 'add_seeker', message: 'Extra seeker entering. Risk reward raised.' };
  }
  if (/stun|shock|zap|freeze/.test(text)) {
    return { action: 'stun_seekers', message: 'Shock burst fired. Seekers are stunned for a moment.' };
  }
  if (/hard|ramp|faster|harder|challenge|difficulty up|more intense/.test(text)) {
    return { action: 'ramp_difficulty', message: 'Difficulty ramped. Seekers are moving with sharper intent.' };
  }
  if (/focus|find me|tell them|broadcast|ping me/.test(text)) {
    return { action: 'focus_seekers', message: 'Challenge ping sent. Seekers know where to converge.' };
  }
  if (/where|hint|gem|exit|gate|objective/.test(text)) {
    return { action: 'reveal_hint', message: 'Hint pulse sent toward the nearest objective.' };
  }
  if (/easy|easier|slow|calm|less difficult|help/.test(text)) {
    return { action: 'slow_seekers', message: 'Seekers slowed. Use the opening.' };
  }
  return { action: 'ease_game', message: 'Pressure softened for a few seconds.' };
}

function normalizeAction(raw, prompt = '') {
  const source = raw && typeof raw === 'object' ? raw : {};
  const action = ACTIONS.includes(source.action) ? source.action : fallbackAction(prompt).action;
  const fallback = fallbackAction(prompt);
  const message = clampText(source.message || fallback.message, 140);
  return { action, message };
}

function stripJsonFences(text = '') {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function parseJsonText(text = '', prompt = '') {
  const clean = stripJsonFences(text);
  try {
    return normalizeAction(JSON.parse(clean), prompt);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return fallbackAction(prompt);
    try {
      return normalizeAction(JSON.parse(match[0]), prompt);
    } catch {
      return fallbackAction(prompt);
    }
  }
}

function readResponsesText(data = {}) {
  if (typeof data.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const part of item.content || []) {
      if (typeof part.text === 'string') chunks.push(part.text);
      if (typeof part.content === 'string') chunks.push(part.content);
    }
  }
  return chunks.join('\n');
}

function compatibleUrl(endpoint = '') {
  const raw = endpoint.trim().replace(/\/+$/, '');
  if (!raw) return '';
  if (/\/(?:chat\/completions|responses)$/i.test(raw)) return raw;
  if (/\/v\d+$/i.test(raw)) return `${raw}/chat/completions`;
  return `${raw}/chat/completions`;
}

async function callOpenAI({ key, model, prompt, gameState }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 160,
      input: [
        { role: 'system', content: systemPrompt() },
        {
          role: 'user',
          content: JSON.stringify({
            playerRequest: clampText(prompt),
            gameState: compactGameState(gameState)
          })
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'rover_action',
          schema: ACTION_SCHEMA,
          strict: true
        }
      }
    })
  });

  if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}`);
  return parseJsonText(readResponsesText(await response.json()), prompt);
}

async function callCompatible({ key, endpoint, model, prompt, gameState }) {
  const url = compatibleUrl(endpoint);
  if (!url) throw new Error('Missing OpenAI-compatible endpoint');
  const lowerUrl = url.toLowerCase();
  const messages = [
    { role: 'system', content: systemPrompt() },
    {
      role: 'user',
      content: JSON.stringify({
        playerRequest: clampText(prompt),
        gameState: compactGameState(gameState)
      })
    }
  ];
  const body = lowerUrl.endsWith('/responses')
    ? {
        model,
        max_output_tokens: 160,
        input: messages,
        text: {
          format: {
            type: 'json_schema',
            name: 'rover_action',
            schema: ACTION_SCHEMA,
            strict: true
          }
        }
      }
    : {
        model,
        messages,
        temperature: 0.2,
        max_tokens: 160,
        response_format: { type: 'json_object' }
      };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Compatible request failed with ${response.status}`);
  const data = await response.json();
  const text = lowerUrl.endsWith('/responses')
    ? readResponsesText(data)
    : data.choices?.[0]?.message?.content || '';
  return parseJsonText(text, prompt);
}

export async function chooseAgentAction(body = {}, env = process.env) {
  const prompt = clampText(body.prompt);
  if (!prompt) return { action: 'ease_game', message: 'Rover is listening.' };

  const key = env.OPENAI_API_KEY || body.apiKey || '';
  const model = clampText(body.model || env.OPENAI_MODEL || RECOMMENDED_MODEL, 80);
  if (!key) return fallbackAction(prompt);

  try {
    if (body.provider === 'openai-compatible') {
      return await callCompatible({
        key,
        endpoint: body.endpoint || env.OPENAI_COMPATIBLE_ENDPOINT || '',
        model,
        prompt,
        gameState: body.gameState
      });
    }
    return await callOpenAI({ key, model, prompt, gameState: body.gameState });
  } catch {
    return fallbackAction(prompt);
  }
}

export { RECOMMENDED_MODEL };
