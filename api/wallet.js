// /api/wallet — saldi on-chain reali di indirizzi EVM via Alchemy (multi-rete),
// con prezzi completati da CoinGecko per i token che Alchemy non quota, e
// filtro anti-spam per i token-truffa. Sola lettura. Key in env ALCHEMY_API_KEY.

const NETWORKS = ['eth-mainnet','polygon-mainnet','arb-mainnet','base-mainnet','opt-mainnet'];
// Alchemy nell'output usa alias diversi (es. matic-mainnet): mappo entrambi.
const NET_LABEL = {
  'eth-mainnet':'Ethereum','polygon-mainnet':'Polygon','matic-mainnet':'Polygon',
  'arb-mainnet':'Arbitrum','arbitrum-mainnet':'Arbitrum','base-mainnet':'Base',
  'opt-mainnet':'Optimism','optimism-mainnet':'Optimism',
};
const NATIVE_SYM = {
  'eth-mainnet':'ETH','polygon-mainnet':'POL','matic-mainnet':'POL',
  'arb-mainnet':'ETH','arbitrum-mainnet':'ETH','base-mainnet':'ETH',
  'opt-mainnet':'ETH','optimism-mainnet':'ETH',
};
const LLAMA_CHAIN = {
  'eth-mainnet':'ethereum','polygon-mainnet':'polygon','matic-mainnet':'polygon',
  'arb-mainnet':'arbitrum','arbitrum-mainnet':'arbitrum','base-mainnet':'base',
  'opt-mainnet':'optimism','optimism-mainnet':'optimism',
};

function hexToFloat(hex, decimals){
  if(!hex) return 0;
  try{ const big = BigInt(hex); const d = BigInt(10) ** BigInt(decimals||18);
    return Number(big/d) + Number(big%d)/Number(d);
  }catch(_){ return 0; }
}

// Riconosce i token-spam (airdrop-phishing): URL nel nome, inviti a "claim",
// simboli con caratteri non-ASCII (es. USDC cirillico), simboli assurdi.
function isSpam(name, symbol){
  const s = `${name||''} ${symbol||''}`.toLowerCase();
  if(/https?:|t\.me|www\.|\.com|\.io|\.xyz|\.org|\.net|\.app|\.fi\b|claim|visit|voucher|reward|airdrop|giveaway|bonus|\$ |access|unlock/i.test(s)) return true;
  if(/[|<>]/.test(`${name||''}${symbol||''}`)) return true;
  const sym = symbol||'';
  if(sym.length===0 || sym.length>12) return true;
  if(/[^\x00-\x7F]/.test(sym)) return true;             // simbolo con caratteri non latini
  if(/[^A-Za-z0-9.\-+]/.test(sym)) return true;          // simbolo con spazi o segni strani
  return false;
}

async function alchemyTokens(key, address){
  const url = `https://api.g.alchemy.com/data/v1/${key}/assets/tokens/by-address`;
  const body = { addresses:[{ address, networks: NETWORKS }], withMetadata:true, withPrices:true, includeNativeTokens:true };
  const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if(!r.ok){ throw new Error(`Alchemy ${r.status}: ${(await r.text()).slice(0,180)}`); }
  return (await r.json())?.data?.tokens || [];
}

// CoinGecko: prezzi per contract mancanti, una chiamata per piattaforma.
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
// DefiLlama: prezzi by-contract, multi-chain, gratis e senza key.
// Una sola chiamata per tutti i token mancanti (chiavi "chain:address").
async function llamaPrices(keys){
  const out = {};
  const uniq = [...new Set(keys)];
  if(uniq.length===0) return out;
  // batch da 60 per non allungare troppo l'URL
  for(let i=0;i<uniq.length;i+=60){
    const batch = uniq.slice(i,i+60);
    const url = `https://coins.llama.fi/prices/current/${batch.join(',')}`;
    for(let attempt=0; attempt<3; attempt++){
      try{
        const r = await fetch(url, { headers:{'accept':'application/json'} });
        if(!r.ok){ if(r.status===429){ await sleep(800*(attempt+1)); continue; } break; }
        const j = await r.json();
        const coins = j?.coins || {};
        for(const [k,v] of Object.entries(coins)){
          if(v && v.price!=null && (v.confidence==null || v.confidence>=0.5)) out[k.toLowerCase()] = Number(v.price);
        }
        break;
      }catch(_){ await sleep(300); }
    }
  }
  return out;
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){ res.status(204).end(); return; }

  const key = process.env.ALCHEMY_API_KEY;
  if(!key){ res.status(500).json({ ok:false, error:'ALCHEMY_API_KEY non configurata su Vercel' }); return; }

  let addresses = [];
  if(req.method==='POST'){ try{ const b = typeof req.body==='string'?JSON.parse(req.body):(req.body||{}); addresses=b.addresses||[]; }catch(_){} }
  if(req.query && req.query.address){ const q=req.query.address; addresses=addresses.concat(Array.isArray(q)?q:[q]); }
  addresses = [...new Set(addresses.map(a=>String(a).trim()).filter(a=>/^0x[a-fA-F0-9]{40}$/.test(a)))];
  if(addresses.length===0){ res.status(200).json({ ok:true, assets:[], totalValue:0, note:'Nessun indirizzo EVM valido (Bitcoin/Solana non supportati).' }); return; }

  try{
    // 1) raccolgo i token grezzi da Alchemy
    let raw = [];
    for(const addr of addresses){ raw = raw.concat(await alchemyTokens(key, addr)); }

    // 2) primo passaggio: filtro spam, calcolo amount/price-noto
    const items = [];
    const missingKeys = [];
    for(const t of raw){
      const meta = t.tokenMetadata || {};
      const isNative = !t.tokenAddress;
      const decimals = isNative ? 18 : (meta.decimals ?? 18);
      const amount = hexToFloat(t.tokenBalance, decimals);
      if(amount <= 0) continue;
      const symbol = isNative ? (NATIVE_SYM[t.network]||'ETH') : (meta.symbol||'');
      const name   = isNative ? (NET_LABEL[t.network]||symbol) : (meta.name||symbol);
      if(!isNative && isSpam(name, symbol)) continue;     // scarto i token-truffa
      const po = Array.isArray(t.tokenPrices) ? (t.tokenPrices.find(p=>p.currency==='usd')||t.tokenPrices[0]) : null;
      let price = po ? Number(po.value) : 0;
      const it = { isNative, symbol, name, amount, price,
        network: NET_LABEL[t.network]||t.network, logo: meta.logo||null,
        contract: t.tokenAddress||null, _net: t.network };
      if(!isNative && (!price || price===0)){            // prezzo mancante → lo chiederò a DefiLlama
        const ch = LLAMA_CHAIN[t.network];
        if(ch){ it._llamaKey = `${ch}:${t.tokenAddress.toLowerCase()}`; missingKeys.push(it._llamaKey); }
      }
      items.push(it);
    }

    // 3) completo i prezzi mancanti con DefiLlama (una chiamata)
    const llama = await llamaPrices(missingKeys);
    for(const it of items){
      if((!it.price || it.price===0) && it._llamaKey){
        const p = llama[it._llamaKey];
        if(p!=null) it.price = p;
      }
    }

    // 4) valore + scarto polvere/illegittimi
    const kept = [];
    for(const it of items){
      it.value = it.amount * (it.price||0);
      if(it.price>0 && it.value<0.01) continue;          // ha prezzo ma è polvere
      if((!it.price || it.price===0) && (!it.logo || it.amount < 1e-4)) continue; // senza prezzo: tengo solo se ha logo e quantità non irrisoria
      kept.push(it);
    }

    // 5) consolido lo stesso simbolo su reti diverse
    const merged = {};
    for(const a of kept){
      const k = a.symbol.toUpperCase();
      if(!merged[k]) merged[k] = { ...a, networks:[a.network] };
      else { merged[k].amount+=a.amount; merged[k].value+=a.value;
        if(!merged[k].networks.includes(a.network)) merged[k].networks.push(a.network);
        if(!merged[k].price && a.price) merged[k].price=a.price; }
    }
    let assets = Object.values(merged).map(a=>({
      id:a.symbol.toLowerCase(), symbol:a.symbol, name:a.name,
      amount:a.amount, price:a.price||0, value:a.value||0,
      price24h:a.price||0, chg24h:0, chg7d:0, mcap:0,
      type:'wallet', exchange:null, network:a.networks.join(', '), logo:a.logo, contract:a.contract,
    })).sort((x,y)=> (y.value - x.value) || (y.amount - x.amount));

    const totalValue = assets.reduce((s,a)=>s+a.value,0);
    assets = assets.map(a=>({ ...a, allocPct: totalValue>0 ? (a.value/totalValue)*100 : 0 }));

    res.status(200).json({
      ok:true, updated:new Date().toISOString(),
      assets, totalValue, totalPnl24h:0,
      onChainValue: totalValue, exchValue:0,
      priced: assets.filter(a=>a.price>0).length, unpriced: assets.filter(a=>a.price===0).length,
    });
  }catch(e){
    res.status(500).json({ ok:false, error:String(e.message||e) });
  }
}
