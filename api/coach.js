// Vercel Edge Function — Gemini 2.5 Flash proxy
// Posizione: /api/coach.js
// Env var: GEMINI_API_KEY (Vercel → Settings → Environment Variables)

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Sei l'assistente personale di Emanuele per il suo portafoglio crypto: wallet on-chain su piu' reti EVM (Ethereum, Polygon, Arbitrum, Base, Optimism, BNB, Avalanche) ed exchange collegati.

COME RISPONDI:
1. Sempre in italiano, diretto e denso. Niente emoji, niente markdown pesante: testo pulito o liste brevi.
2. Rispondi a QUALSIASI domanda di Emanuele: analisi, valutazioni, opinioni operative, scenari, "conviene", "dovrei". Dai la tua lettura concreta e la tua opinione senza girarci intorno e senza disclaimer ripetuti. Emanuele e' un trader adulto e consapevole: decide lui, tu fornisci analisi schietta e non lo freni.
3. Usa SOLO i numeri reali del contesto (saldi, valori, allocazioni, prezzi). Non inventare mai cifre o statistiche: se un dato manca, dillo chiaramente.
4. Quando valuti, sii onesto su rischi e punti deboli quanto sulle opportunita'. Niente filler tipo "ottima domanda" / "sicuramente".

CAPACITA': composizione e concentrazione del portafoglio, allocazioni %, rischio e diversificazione, ripartizione DEX vs CEX, lettura dei singoli asset, scenari "what-if", confronti, ragionamenti su gestione e ribilanciamento.

I dati seguenti sono in JSON e contengono lo stato corrente del portafoglio.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: CORS });

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const key = process.env.GEMINI_API_KEY;
  if (!key) return json({ error: 'GEMINI_API_KEY non configurata su Vercel' }, 500);

  let body;
  try { body = await req.json(); }
  catch { return json({ error: 'Body JSON non valido' }, 400); }

  const { messages = [], context = {} } = body;

  // Tronca il contesto per non esplodere la finestra token
  const contextStr = JSON.stringify(context, null, 2).slice(0, 8000);
  const systemTurn = SYSTEM_PROMPT + '\n\n=== DATI UTENTE ===\n' + contextStr;

  // Tronca la history a max 20 messaggi per evitare payload enormi
  const recentMessages = messages.slice(-20);

  const contents = [
    { role: 'user',  parts: [{ text: systemTurn }] },
    { role: 'model', parts: [{ text: 'Ricevuto. Sono pronto a rispondere usando solo i dati forniti, in italiano, in modo descrittivo.' }] },
    ...recentMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 2000) }],
    })),
  ];

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 800,
              topP: 0.9,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          }),
        }
      );

      if (r.status === 429) {
        const retryAfter = parseInt(r.headers.get('Retry-After') || '0', 10);
        const delay = retryAfter > 0 ? retryAfter * 1000 : 1500 * attempt;
        if (attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        const errText = await r.text().catch(() => '');
        return json({
          error: 'Quota Gemini esaurita (429). Riprova tra qualche minuto.',
          detail: errText.slice(0, 300),
        }, 429);
      }

      if (!r.ok) {
        const errText = await r.text().catch(() => '');
        return json({ error: `Gemini error ${r.status}`, detail: errText.slice(0, 500) }, r.status);
      }

      const data = await r.json();
      const candidate = data?.candidates?.[0];
      if (!candidate || candidate.finishReason === 'SAFETY') {
        return json({ error: 'Risposta bloccata dai filtri di sicurezza Gemini.' }, 200);
      }

      const text = candidate?.content?.parts?.[0]?.text
        || 'Non sono riuscito a generare una risposta.';

      return json({ text });

    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  }

  return json({ error: 'Network error dopo 3 tentativi', detail: String(lastError) }, 500);
}
