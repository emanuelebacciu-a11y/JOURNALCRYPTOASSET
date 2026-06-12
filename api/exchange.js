// /api/exchange — legge i saldi di un exchange (per ora Kraken) in sola lettura.
// Il secret resta sul server: la firma è calcolata qui, mai nel browser.
import crypto from 'crypto';

/* ---------- KRAKEN ---------- */
function krakenSign(path, requestData, secret){
  const postData = new URLSearchParams(requestData).toString();
  const sha256 = crypto.createHash('sha256').update(requestData.nonce + postData).digest();
  const hmac = crypto.createHmac('sha512', Buffer.from(secret, 'base64'));
  hmac.update(path, 'binary'); hmac.update(sha256);
  return hmac.digest('base64');
}
// Normalizza i ticker Kraken ai simboli standard
const KRAKEN_MAP = { XXBT:'BTC', XBT:'BTC', XXDG:'DOGE', XDG:'DOGE', XETH:'ETH', XETC:'ETC',
  XLTC:'LTC', XMLN:'MLN', XREP:'REP', XXLM:'XLM', XXMR:'XMR', XXRP:'XRP', XZEC:'ZEC',
  ZUSD:'USD', ZEUR:'EUR', ZGBP:'GBP', ZCAD:'CAD', ZJPY:'JPY', ZAUD:'AUD' };
const STABLES = new Set(['USD','USDT','USDC','DAI','EUR','GBP','TUSD','PYUSD','USDG']);
function normSym(k){
  let s = KRAKEN_MAP[k] || k;
  s = s.replace(/\.(F|S|M|B|HOLD|P)$/i,'');       // suffissi staking/earn Kraken (es. ETH.S)
  if(KRAKEN_MAP[s]) s = KRAKEN_MAP[s];
  return s;
}

async function krakenBalances(apiKey, apiSecret){
  const path = '/0/private/Balance';
  const body = { nonce: String(Date.now()*1000) };
  const sign = krakenSign(path, body, apiSecret);
  const r = await fetch('https://api.kraken.com'+path, {
    method:'POST',
    headers:{ 'API-Key':apiKey, 'API-Sign':sign, 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });
  const j = await r.json();
  if(j.error && j.error.length){ throw new Error('Kraken: '+j.error.join('; ')); }
  return j.result || {};
}

// Prezzi via Kraken Ticker pubblico (coerente con l'exchange)
async function krakenPrices(symbols){
  const out = {}; const need = symbols.filter(s=>!STABLES.has(s));
  if(need.length===0) return out;
  const pairs = need.map(s=>`${s}USD`);
  try{
    const r = await fetch('https://api.kraken.com/0/public/Ticker?pair='+pairs.join(','));
    const j = await r.json();
    const res = j.result || {};
    for(const [pair,data] of Object.entries(res)){
      const last = data?.c?.[0] ? Number(data.c[0]) : null;
      if(last==null) continue;
      // il nome pair restituito può differire: cerco quale simbolo combacia
      for(const s of need){
        if(pair.includes(s) || pair.includes(KRAKEN_MAP[s]||s)){ out[s]=last; break; }
      }
    }
  }catch(_){}
  return out;
}

/* ---------- HANDLER ---------- */
export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){ res.status(204).end(); return; }
  if(req.method!=='POST'){ res.status(405).json({ok:false,error:'Solo POST'}); return; }

  let body={}; try{ body = typeof req.body==='string'?JSON.parse(req.body):(req.body||{}); }catch(_){}
  const accounts = body.accounts || (body.exchangeId ? [body] : []);
  if(accounts.length===0){ res.status(200).json({ok:true,assets:[],totalValue:0}); return; }

  try{
    const bySymbol = {};        // simbolo -> {amount, exchange}
    for(const acc of accounts){
      const id = (acc.exchangeId||'').toLowerCase();
      if(id!=='kraken'){ continue; }   // altri exchange: in arrivo
      if(!acc.apiKey || !acc.apiSecret){ throw new Error('Kraken: API key/secret mancanti'); }
      const bal = await krakenBalances(acc.apiKey, acc.apiSecret);
      for(const [k,amtStr] of Object.entries(bal)){
        const amt = Number(amtStr);
        if(!(amt>0)) continue;
        const sym = normSym(k);
        if(!bySymbol[sym]) bySymbol[sym] = { amount:0, exchange:acc.name||'Kraken' };
        bySymbol[sym].amount += amt;
      }
    }
    const symbols = Object.keys(bySymbol);
    const prices = await krakenPrices(symbols);
    let assets = symbols.map(s=>{
      const amount = bySymbol[s].amount;
      const price = STABLES.has(s) ? (s==='USD'?1:(prices[s]||1)) : (prices[s]||0);
      return { id:s.toLowerCase(), symbol:s, name:s, amount, price, value:amount*price,
        price24h:price, chg24h:0, chg7d:0, mcap:0, type:'exchange',
        exchange:bySymbol[s].exchange, network:bySymbol[s].exchange, logo:null, contract:null };
    }).filter(a=>a.value>=0.01 || a.price===0).sort((x,y)=>y.value-x.value);
    const totalValue = assets.reduce((s,a)=>s+a.value,0);
    assets = assets.map(a=>({...a, allocPct: totalValue>0?(a.value/totalValue)*100:0}));
    res.status(200).json({ ok:true, updated:new Date().toISOString(), assets, totalValue, exchValue:totalValue });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
}
