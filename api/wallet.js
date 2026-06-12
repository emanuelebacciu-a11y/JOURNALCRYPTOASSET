// /api/wallet — legge i saldi on-chain reali di uno o più indirizzi EVM via Alchemy
// Portfolio API (tokens by-address): una chiamata, multi-rete, con metadati e prezzi.
// La API key resta sul server (env ALCHEMY_API_KEY). Sola lettura.

const NETWORKS = ['eth-mainnet','polygon-mainnet','arb-mainnet','base-mainnet','opt-mainnet'];
const NET_LABEL = { 'eth-mainnet':'Ethereum','polygon-mainnet':'Polygon','arb-mainnet':'Arbitrum','base-mainnet':'Base','opt-mainnet':'Optimism' };
const NATIVE_SYM = { 'eth-mainnet':'ETH','polygon-mainnet':'POL','arb-mainnet':'ETH','base-mainnet':'ETH','opt-mainnet':'ETH' };

function hexToFloat(hex, decimals){
  if(!hex) return 0;
  try{ const big = BigInt(hex); const d = BigInt(10) ** BigInt(decimals||18);
    const whole = big / d; const frac = big % d;
    return Number(whole) + Number(frac)/Number(d);
  }catch(_){ return 0; }
}

async function fetchAddress(key, address){
  const url = `https://api.g.alchemy.com/data/v1/${key}/assets/tokens/by-address`;
  const body = { addresses: [{ address, networks: NETWORKS }], withMetadata: true, withPrices: true, includeNativeTokens: true };
  const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!r.ok){ const t = await r.text(); throw new Error(`Alchemy ${r.status}: ${t.slice(0,200)}`); }
  const j = await r.json();
  return (j?.data?.tokens) || [];
}

function normalize(tokens){
  const out = [];
  for(const t of tokens){
    const meta = t.tokenMetadata || {};
    const isNative = !t.tokenAddress;
    const decimals = isNative ? 18 : (meta.decimals ?? 18);
    const amount = hexToFloat(t.tokenBalance, decimals);
    if(amount <= 0) continue;
    const priceObj = Array.isArray(t.tokenPrices) ? t.tokenPrices.find(p=>p.currency==='usd') || t.tokenPrices[0] : null;
    const price = priceObj ? Number(priceObj.value) : 0;
    const value = amount * price;
    const symbol = isNative ? (NATIVE_SYM[t.network]||'ETH') : (meta.symbol || '???');
    if(!isNative && (!meta.symbol || price===0)) continue;        // salta spam/senza prezzo
    if(value < 0.01) continue;                                     // polvere
    out.push({
      id: `${t.network}:${(t.tokenAddress||'native')}`,
      symbol, name: isNative ? (NET_LABEL[t.network]||symbol) : (meta.name||symbol),
      amount, price, value,
      chg24h: 0, chg7d: 0,
      type: 'wallet', exchange: null,
      network: NET_LABEL[t.network] || t.network,
      logo: meta.logo || null,
      contract: t.tokenAddress || null,
    });
  }
  // consolida lo stesso simbolo su reti diverse
  const merged = {};
  for(const a of out){
    const k = a.symbol.toUpperCase();
    if(!merged[k]) merged[k] = { ...a, networks:[a.network] };
    else { merged[k].amount += a.amount; merged[k].value += a.value;
           if(!merged[k].networks.includes(a.network)) merged[k].networks.push(a.network);
           if(!merged[k].price && a.price) merged[k].price = a.price; }
  }
  return Object.values(merged).map(a=>({ ...a, id:a.symbol.toLowerCase() })).sort((x,y)=>y.value-x.value);
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){ res.status(204).end(); return; }

  const key = process.env.ALCHEMY_API_KEY;
  if(!key){ res.status(500).json({ ok:false, error:'ALCHEMY_API_KEY non configurata su Vercel' }); return; }

  // indirizzi: da query ?address=0x.. (ripetibile) o body {addresses:[...]}
  let addresses = [];
  if(req.method==='POST'){
    try{ const b = typeof req.body==='string'? JSON.parse(req.body): (req.body||{}); addresses = b.addresses||[]; }catch(_){}
  }
  if(req.query){ const q = req.query.address; if(q) addresses = addresses.concat(Array.isArray(q)?q:[q]); }
  addresses = [...new Set(addresses.map(a=>String(a).trim()).filter(a=>/^0x[a-fA-F0-9]{40}$/.test(a)))]; // solo EVM

  if(addresses.length===0){ res.status(200).json({ ok:true, assets:[], totalValue:0, note:'Nessun indirizzo EVM valido. Bitcoin/Solana non supportati da questo endpoint.' }); return; }

  try{
    let all = [];
    for(const addr of addresses){ const toks = await fetchAddress(key, addr); all = all.concat(toks); }
    const assets = normalize(all);
    const totalValue = assets.reduce((s,a)=>s+a.value,0);
    const onChainValue = totalValue;                 // tutto on-chain qui
    const withAlloc = assets.map(a=>({ ...a, allocPct: totalValue>0 ? (a.value/totalValue)*100 : 0 }));
    res.status(200).json({
      ok:true,
      updated: new Date().toISOString(),
      assets: withAlloc,
      totalValue,
      totalPnl24h: 0,            // richiede storico prezzi: non disponibile in lettura istantanea
      onChainValue,
      exchValue: 0,
    });
  }catch(e){
    res.status(500).json({ ok:false, error: String(e.message||e) });
  }
}
