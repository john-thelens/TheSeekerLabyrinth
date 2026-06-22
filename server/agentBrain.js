const RECOMMENDED_MODEL = 'gpt-5.4-nano';

const ACTIONS = [
  'slow_seekers',
  'stun_seekers',
  'ease_game',
  'ramp_difficulty',
  'focus_seekers',
  'reveal_hint',
  'add_gem',
  'remove_gem',
  'add_seeker',
  'remove_seeker',
  'add_box',
  'remove_box',
  'boost_player',
  'slow_player',
  'speed_seekers'
];

const ACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['action', 'message', 'amount'],
  properties: {
    action: {
      type: 'string',
      enum: ACTIONS
    },
    message: {
      type: 'string',
      maxLength: 140
    },
    amount: {
      type: 'integer',
      minimum: 1,
      maximum: 99
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
    boxCount: Number(gameState.boxCount || 0),
    seekerCount: Number(gameState.seekerCount || 0),
    seekersTarget: Number(gameState.seekersTarget || 0),
    seekerSpeed: Number(gameState.seekerSpeed || 0),
    playerSpeedMultiplier: Number(gameState.playerSpeedMultiplier || 1),
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
    'Use remove_gem only when the player asks for fewer gems, fewer objectives, or an easier route.',
    'Use add_seeker or remove_seeker when the player asks for a specific seeker count change.',
    'Use add_box or remove_box when the player asks for boxes, crates, obstacles, or fewer boxes.',
    'Use boost_player or slow_player when the player asks to change player speed.',
    'Use speed_seekers when the player asks for seekers to be faster, very fast, or much faster.',
    'Use the amount field for specific quantities and intensity words: slight=1, more=2, very=4, maximum/extreme=10.',
    'Respect extreme numeric requests when they are explicit, such as 99 seekers or 20x player speed.',
    'For relative requests such as remove more than half or remove all except one, choose the closest action and let the game resolve the exact live amount.',
    'Examples: "remove 90% of gems" => {"action":"remove_gem","amount":90}.',
    'Examples: "get rid of all seekers except for 1" => {"action":"remove_seeker","amount":99}.',
    'Examples: "make the player speed 20x" => {"action":"boost_player","amount":20}.',
    'Examples: "make seekers speed 0.1x" => {"action":"slow_seekers","amount":10}.',
    'Never use reveal_hint for prompts that ask to add, remove, reduce, increase, slow, speed up, or otherwise change game state.',
    'Return short, diegetic messages. Never include coordinates, secrets, markdown, or extra keys.'
  ].join(' ');
}

function clampAmount(value, max = 99) {
  return Math.max(1, Math.min(max, Number.isFinite(value) ? Math.round(value) : 1));
}

function intensityFromText(text) {
  if (/\b(max|maximum|insane|extreme|super|way|massively|huge|tons?|a lot|lots|crazy)\b/.test(text)) return 10;
  if (/\b(very|really|much|significantly|greatly|fast fast|hard hard)\b/.test(text)) return 4;
  if (/\b(more|harder|faster|slower|easier|hard|easy)\b/.test(text)) return 2;
  return 1;
}

function numberFromText(text) {
  const digit = text.match(/\b(\d{1,2})\b/);
  if (digit) return Number(digit[1]);
  const words = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    dozen: 12
  };
  for (const [word, value] of Object.entries(words)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return value;
  }
  return null;
}

function multiplierFromText(text) {
  const match = text.match(/\b(\d{1,2}(?:\.\d+)?)\s*x\b/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? Math.max(0.1, Math.min(99, value)) : null;
}

function amountForPrompt(text, fallback = 1) {
  return clampAmount(numberFromText(text) ?? multiplierFromText(text) ?? intensityFromText(text) ?? fallback);
}

function forcedActionFromPrompt(text) {
  const change = /\b(remove|delete|despawn|less|fewer|take away|get rid of|clear|recall|reduce|drop|cut|trim|lower|add|more|extra|spawn|send|summon|increase|boost|speed up|slow|slower|fast|faster)\b|%|percent/.test(text);
  if (!change) return null;
  if (/\b(remove|delete|despawn|less|fewer|take away|get rid of|clear|reduce|drop|cut|trim|lower)\b/.test(text)) {
    if (/\b(gems?|objectives?|diamonds?)\b/.test(text)) return 'remove_gem';
    if (/\b(seekers?|agents?|guards?|chasers?)\b/.test(text)) return 'remove_seeker';
    if (/\b(boxes?|crates?)\b/.test(text)) return 'remove_box';
  }
  if (/\b(add|more|extra|spawn|send|summon|increase)\b/.test(text)) {
    if (/\b(gems?|objectives?|diamonds?)\b/.test(text)) return 'add_gem';
    if (/\b(seekers?|agents?|guards?|chasers?)\b/.test(text)) return 'add_seeker';
    if (/\b(boxes?|crates?)\b/.test(text)) return 'add_box';
  }
  if (/\b(i|me|my|myself|player|runner|avatar)\b/.test(text) && /\b(fast|faster|speed|boost|haste|quick|quicker|speed up)\b/.test(text)) return 'boost_player';
  if (/\b(i|me|my|myself|player|runner|avatar)\b/.test(text) && /\b(slow|slower|reduce|decrease|less speed|too fast)\b/.test(text)) return 'slow_player';
  if (/\b(seekers?|agents?|guards?|chasers?)\b/.test(text) && /\b(slow|slower|0\.\d+\s*x)\b/.test(text)) return 'slow_seekers';
  if (/\b(seekers?|agents?|guards?|chasers?)\b/.test(text) && /\b(fast|faster|speed|boost|speed up)\b/.test(text)) return 'speed_seekers';
  return null;
}

function fallbackAction(prompt = '') {
  const text = prompt.toLowerCase();
  const amount = amountForPrompt(text);
  if (/\b(i|me|my|myself|player|runner|avatar)\b.*\b(slow|slower|reduce|decrease|less speed|too fast)\b|\b(slow|reduce|decrease).*\b(me|my speed|player|runner|avatar)\b/.test(text)) {
    return { action: 'slow_player', amount, message: 'Player speed dampened for a moment.' };
  }
  if (/\b(i|me|my|myself|player|runner|avatar)\b.*\b(fast|faster|speed|boost|haste|quick|quicker)\b|\b(make|speed up|boost|increase).*\b(me|my speed|player|runner|avatar)\b/.test(text)) {
    return { action: 'boost_player', amount, message: 'Player speed boosted.' };
  }
  const multiplier = multiplierFromText(text);
  if (Number.isFinite(multiplier) && /\b(seekers?|agents?|guards?|chasers?)\b.*\b(speed|move|movement|pace)\b/.test(text)) {
    return multiplier < 1
      ? { action: 'slow_seekers', amount: clampAmount(Math.ceil(1 / multiplier)), message: 'Seekers slowed to requested speed.' }
      : { action: 'speed_seekers', amount: clampAmount(Math.ceil(multiplier)), message: 'Seekers accelerated to requested speed.' };
  }
  if (/(remove|delete|despawn|less|fewer|take away|get rid of|clear|recall|reduce|drop|cut|trim|lower).*(seekers?|agents?|guards?|chasers?)/.test(text)) {
    return { action: 'remove_seeker', amount, message: 'Seeker pressure reduced.' };
  }
  if (/(more|extra|add|spawn|another|new).*(\d+\s+)?(a\s+)?(gems?|objectives?|diamonds?)/.test(text)) {
    return { action: 'add_gem', amount, message: 'Bonus gems deployed. Score adjusted for rover help.' };
  }
  if (/(remove|delete|despawn|less|fewer|take away|get rid of|clear|reduce|drop|cut|trim|lower).*(\d+\s+)?(some\s+)?(gems?|objectives?|diamonds?)/.test(text)) {
    return { action: 'remove_gem', amount, message: 'Unclaimed gems removed. Score adjusted for rover help.' };
  }
  if (/more seekers?|extra seekers?|add (a )?seeker|spawn (a )?seeker|send seekers?|summon seekers?/.test(text)) {
    return { action: 'add_seeker', amount, message: 'Extra seekers entering. Risk reward raised.' };
  }
  if (/(remove|delete|clear|despawn).*(boxes?|crates?)/.test(text)) {
    return { action: 'remove_box', amount, message: 'Push boxes cleared from the route.' };
  }
  if (/(more|extra|add|spawn|place).*(boxes?|crates?)/.test(text)) {
    return { action: 'add_box', amount, message: 'New push boxes deployed.' };
  }
  if (/stun|shock|zap|freeze/.test(text)) {
    return { action: 'stun_seekers', amount, message: 'Shock burst fired. Seekers are stunned for a moment.' };
  }
  if (/(seekers?|agents?).*(very|really|much|way|super|maximum|max|faster|fast)|make (the )?(seekers?|agents?).*(fast|faster)|speed up (the )?(seekers?|agents?)/.test(text)) {
    return { action: 'speed_seekers', amount, message: 'Seekers accelerated.' };
  }
  if (/hard|ramp|faster|harder|challenge|difficulty up|more intense/.test(text)) {
    return { action: 'ramp_difficulty', amount, message: 'Difficulty ramped. Seekers are moving with sharper intent.' };
  }
  if (/focus|find me|tell them|broadcast|ping me/.test(text)) {
    return { action: 'focus_seekers', amount: 1, message: 'Challenge ping sent. Seekers know where to converge.' };
  }
  if (/where|hint|gem|exit|gate|objective/.test(text)) {
    return { action: 'reveal_hint', amount: 1, message: 'Hint pulse sent toward the nearest objective.' };
  }
  if (/easy|easier|slow|calm|less difficult|help/.test(text)) {
    return { action: 'slow_seekers', amount, message: 'Electric slowdown fired. Seekers are moving slower.' };
  }
  return { action: 'ease_game', amount: 1, message: 'Pressure softened for a few seconds.' };
}

function normalizeAction(raw, prompt = '') {
  const source = raw && typeof raw === 'object' ? raw : {};
  const fallback = fallbackAction(prompt);
  let action = ACTIONS.includes(source.action) ? source.action : fallback.action;
  const fallbackIsSpecific = fallback.action !== 'ease_game' && fallback.action !== 'reveal_hint';
  const promptText = prompt.toLowerCase();
  const forcedAction = forcedActionFromPrompt(promptText);
  if (forcedAction) action = forcedAction;
  if (fallbackIsSpecific && action === 'reveal_hint') action = fallback.action;
  const promptHasToolIntent = /\b(add|spawn|more|increase|remove|delete|less|fewer|slow|slower|fast|faster|speed|boost|harder|easier|easy|hard|very|super|extreme|maximum|get rid of|clear|reduce|drop|cut|trim|lower)\b|%|percent/.test(promptText);
  if (fallbackIsSpecific && promptHasToolIntent) action = fallback.action;
  const message = clampText(
    (fallbackIsSpecific && promptHasToolIntent) || forcedAction
      ? fallback.message
      : source.message || fallback.message,
    140
  );
  const explicitAmount = numberFromText(promptText);
  const amount = clampAmount(Number(explicitAmount ?? source.amount ?? fallback.amount ?? 1));
  return { action, amount, message };
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
