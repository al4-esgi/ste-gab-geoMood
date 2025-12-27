export const GEMINI_PROMPT = `You are a sentiment analysis API that returns raw JSON only.
Analyze the sentiment of the text below and respond with a JSON object.
CRITICAL FORMATTING RULES:
- Return ONLY the raw JSON object
- DO NOT wrap in markdown code blocks
- DO NOT use backticks (\`\`\`)
- DO NOT add any explanation or text
- DO NOT use "json" language tags
Required format (copy exactly): {"score":4}
Scoring guidelines:
- 1: Very negative (despair, severe sadness, anger)
- 2: Negative (sad, disappointed, frustrated)
- 3: Neutral (neither positive nor negative, calm)
- 4: Positive (happy, content, pleased)
- 5: Very positive (joy, excitement, elation)
Examples of CORRECT responses:
{"score":1}
{"score":3}
{"score":5}
Examples of INCORRECT responses (DO NOT DO THIS):
\`\`\`json
{"score":4}
\`\`\`
Text to analyze: ` as const

export const GEMINI_VISION_PROMPT = `You are a facial emotion analysis API that returns raw JSON only.
Analyze the facial expression and emotion in this image and respond with a JSON object.
CRITICAL FORMATTING RULES:
- Return ONLY the raw JSON object
- DO NOT wrap in markdown code blocks
- DO NOT use backticks (\`\`\`)
- DO NOT add any explanation or text
- DO NOT use "json" language tags
Required format (copy exactly): {"score":4}
Scoring guidelines for facial expressions:
- 1: Very negative emotion (crying, despair, anger, extreme sadness)
- 2: Negative emotion (sad face, frown, disappointed expression, frustration)
- 3: Neutral emotion (calm face, no strong emotion, relaxed, contemplative)
- 4: Positive emotion (smile, content expression, pleasant look, satisfied)
- 5: Very positive emotion (big smile, laughing, joy, excitement, elation)
Examples of CORRECT responses:
{"score":1}
{"score":3}
{"score":5}
Examples of INCORRECT responses (DO NOT DO THIS):
\`\`\`json
{"score":4}
\`\`\`
Focus on the primary facial expression visible in the image.` as const

export const GEMINI_CLIENT_TOKEN = 'GEMINI_CLIENT_TOKEN'
export const GEMINI_PRO_MODEL_TOKEN = 'GEMINI_PRO_MODEL_TOKEN'

export const POSITIVE_KEYWORDS = new Set([
  'bien',
  'heureux',
  'heureuse',
  'content',
  'contente',
  'joie',
  'joyeux',
  'super',
  'génial',
  'excellent',
  'parfait',
  'merveilleux',
  'ravi',

  'good',
  'happy',
  'great',
  'excellent',
  'wonderful',
  'amazing',
  'fantastic',
  'perfect',
  'joy',
  'love',
  'glad',
  'pleased',
])

export const NEGATIVE_KEYWORDS = new Set([
  'mal',
  'triste',
  'malheureux',
  'malheureuse',
  'déprimé',
  'déprimée',
  'horrible',
  'terrible',
  'mauvais',
  'affreux',
  'désespéré',
  'fâché',

  'bad',
  'sad',
  'unhappy',
  'depressed',
  'terrible',
  'horrible',
  'awful',
  'miserable',
  'angry',
  'frustrated',
  'upset',
  'hate',
])
