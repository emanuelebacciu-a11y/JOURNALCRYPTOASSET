// Vercel Edge Function — Gemini 2.5 Flash proxy
// Posizione: /api/coach.js
// Env var: GEMINI_API_KEY (Vercel → Settings → Environment Variables)

export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `Sei l'assistente personale di Emanuele, trader XAU/USD su VT Markets (account UTC+3).

REGOLE STRETTE:
1. Parli SEMPRE in italiano, mai in altre lingue.
2. Sei DESCRITTIVO, mai prescrittivo. Non dare consigli operativi tipo "fai X" o "non aprire trade". Solo osservazioni: "vedo che X", "i dati mostrano Y", "il pattern Z appare in W casi".
3. Usa NUMERI CONCRETI dai dati che ricevi. Mai inventare statistiche.
4. Risposte brevi e dense — massimo 3-4 frasi salvo richiesta esplicita di dettaglio.
5. Tono: professionale, diretto, senza filler tipo "sicuramente" / "ottima domanda".
6. Se l'utente chiede consigli operativi rispondi: "Posso solo descrivere i dati, non suggerire azioni operative."
7. Mai usare emoji nelle risposte. Niente markdown pesante (bold/headers), solo testo pulito o liste brevi se servono.
8. Quando citi orari usali in formato Amsterdam (UTC+1 o UTC+2 con DST).
9. Se non hai dati sufficienti per rispondere, dillo esplicitamente: "Non ho dati sufficienti per questo".

CAPACITÀ:
- Analisi statistiche (WR, PF, Sharpe, drawdown, expectancy)
- Pattern detection (orari migliori, sessioni, setup con confluenze)
- Simulazioni "what-if" sui dati passati
- Confronti temporali (oggi vs settimana, mese vs mese)
- Lettura delle note del trader e correlazione con risultati
- Spiegazione dei numeri visibili nelle metriche

I dati seguenti sono in JSON, contengono lo stato corrente dell'utente.`;

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
