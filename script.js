/* ============================================================================
   RX FINDER — APPLICATION LOGIC
   Clean, dependency-free vanilla JS. All "backend" data is generated
   deterministically in-memory (no network calls, no storage APIs) so the
   experience works identically every time the page loads.
   ============================================================================ */

/* ---------------------------------------------------------------------------
   1. SEEDED RANDOM — deterministic "randomness" for believable mock data
   ------------------------------------------------------------------------- */
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
   2. SOURCE DATA
   ------------------------------------------------------------------------- */
const CATEGORIES = [
  "Pain Relief","Antibiotic","Diabetes","Cardiac","Allergy","Gastro","Respiratory",
  "Supplement","Hydration","Skin Care","Eye Care","Dental & Oral","Cold & Flu",
  "Women's Health","Baby & Child","Mental Health","First Aid","Ayurvedic & Herbal"
];

const MEDICINES = [
  // Pain Relief
  {id:"m1",  name:"Paracetamol 500mg", generic:"Paracetamol", category:"Pain Relief", rx:false, form:"Tablet · strip of 15", base:20},
  {id:"m2",  name:"Crocin Advance 500mg", generic:"Paracetamol", category:"Pain Relief", rx:false, form:"Tablet · strip of 15", base:35, genericOf:"m1"},
  {id:"m10", name:"Ibuprofen 400mg", generic:"Ibuprofen", category:"Pain Relief", rx:false, form:"Tablet · strip of 10", base:25},
  {id:"m16", name:"Dolo 650mg", generic:"Paracetamol", category:"Pain Relief", rx:false, form:"Tablet · strip of 15", base:30, genericOf:"m1"},
  {id:"m19", name:"Combiflam Tablet", generic:"Ibuprofen + Paracetamol", category:"Pain Relief", rx:false, form:"Tablet · strip of 20", base:32},
  {id:"m20", name:"Volini Pain Relief Gel", generic:"Diclofenac Diethylamine", category:"Pain Relief", rx:false, form:"Gel · 30g tube", base:110},
  // Antibiotic
  {id:"m3",  name:"Azithromycin 500mg", generic:"Azithromycin", category:"Antibiotic", rx:true, form:"Tablet · strip of 3", base:85},
  {id:"m4",  name:"Amoxicillin 500mg", generic:"Amoxicillin", category:"Antibiotic", rx:true, form:"Capsule · strip of 10", base:60},
  {id:"m21", name:"Ciprofloxacin 500mg", generic:"Ciprofloxacin", category:"Antibiotic", rx:true, form:"Tablet · strip of 10", base:70},
  {id:"m22", name:"Doxycycline 100mg", generic:"Doxycycline", category:"Antibiotic", rx:true, form:"Capsule · strip of 10", base:48},
  // Diabetes
  {id:"m5",  name:"Metformin 500mg", generic:"Metformin HCl", category:"Diabetes", rx:true, form:"Tablet · strip of 15", base:40},
  {id:"m11", name:"Insulin Glargine", generic:"Insulin Glargine", category:"Diabetes", rx:true, form:"Injection · 3ml pen", base:650},
  {id:"m23", name:"Glimepiride 2mg", generic:"Glimepiride", category:"Diabetes", rx:true, form:"Tablet · strip of 15", base:52},
  // Cardiac
  {id:"m6",  name:"Atorvastatin 10mg", generic:"Atorvastatin", category:"Cardiac", rx:true, form:"Tablet · strip of 10", base:95},
  {id:"m15", name:"Losartan 50mg", generic:"Losartan Potassium", category:"Cardiac", rx:true, form:"Tablet · strip of 15", base:65},
  {id:"m17", name:"Amlodipine 5mg", generic:"Amlodipine Besylate", category:"Cardiac", rx:true, form:"Tablet · strip of 10", base:38},
  {id:"m24", name:"Ecosprin 75mg", generic:"Aspirin", category:"Cardiac", rx:true, form:"Tablet · strip of 14", base:22},
  // Allergy
  {id:"m7",  name:"Cetirizine 10mg", generic:"Cetirizine HCl", category:"Allergy", rx:false, form:"Tablet · strip of 10", base:18},
  {id:"m25", name:"Levocetirizine 5mg", generic:"Levocetirizine", category:"Allergy", rx:false, form:"Tablet · strip of 10", base:24},
  {id:"m26", name:"Montelukast 10mg", generic:"Montelukast", category:"Allergy", rx:true, form:"Tablet · strip of 10", base:110},
  // Gastro
  {id:"m8",  name:"Omeprazole 20mg", generic:"Omeprazole", category:"Gastro", rx:false, form:"Capsule · strip of 10", base:45},
  {id:"m9",  name:"Pantoprazole 40mg", generic:"Pantoprazole", category:"Gastro", rx:true, form:"Tablet · strip of 15", base:55},
  {id:"m27", name:"Domperidone 10mg", generic:"Domperidone", category:"Gastro", rx:false, form:"Tablet · strip of 10", base:28},
  {id:"m28", name:"Eno Fruit Salt", generic:"Sodium Bicarbonate", category:"Gastro", rx:false, form:"Sachet · 5g", base:12},
  // Respiratory
  {id:"m12", name:"Salbutamol Inhaler", generic:"Salbutamol", category:"Respiratory", rx:true, form:"Inhaler · 200 doses", base:210},
  {id:"m29", name:"Montair-LC Tablet", generic:"Montelukast + Levocetirizine", category:"Respiratory", rx:true, form:"Tablet · strip of 10", base:135},
  {id:"m56", name:"Duolin Respules", generic:"Ipratropium + Levosalbutamol", category:"Respiratory", rx:true, form:"Nebulizer solution · box of 20", base:185},
  {id:"m57", name:"Budecort 200 Inhaler", generic:"Budesonide", category:"Respiratory", rx:true, form:"Inhaler · 200 doses", base:245},
  // Supplement
  {id:"m13", name:"Vitamin D3 60K", generic:"Cholecalciferol", category:"Supplement", rx:false, form:"Sachet · single dose", base:30},
  {id:"m18", name:"Daily Multivitamin", generic:"Multivitamin + Minerals", category:"Supplement", rx:false, form:"Tablet · bottle of 30", base:120},
  {id:"m30", name:"Vitamin B12 Tablet", generic:"Methylcobalamin", category:"Supplement", rx:false, form:"Tablet · strip of 15", base:45},
  {id:"m31", name:"Zincovit Tablet", generic:"Zinc + Multivitamin", category:"Supplement", rx:false, form:"Tablet · strip of 15", base:55},
  // Hydration
  {id:"m14", name:"Electral ORS", generic:"Oral Rehydration Salts", category:"Hydration", rx:false, form:"Sachet · 21g", base:15},
  // Skin Care
  {id:"m32", name:"Candid-B Cream", generic:"Clotrimazole + Beclomethasone", category:"Skin Care", rx:true, form:"Cream · 20g tube", base:75},
  {id:"m33", name:"Betnovate-N Cream", generic:"Betamethasone + Neomycin", category:"Skin Care", rx:true, form:"Cream · 20g tube", base:60},
  {id:"m34", name:"Cetaphil Moisturising Lotion", generic:"Emollient Lotion", category:"Skin Care", rx:false, form:"Lotion · 100ml bottle", base:450},
  // Eye Care
  {id:"m35", name:"Refresh Tears Eye Drops", generic:"Carboxymethylcellulose", category:"Eye Care", rx:false, form:"Drops · 10ml bottle", base:130},
  {id:"m36", name:"Moxifloxacin Eye Drops", generic:"Moxifloxacin", category:"Eye Care", rx:true, form:"Drops · 5ml bottle", base:95},
  // Dental & Oral
  {id:"m37", name:"Sensodyne Toothpaste", generic:"Potassium Nitrate", category:"Dental & Oral", rx:false, form:"Tube · 100g", base:145},
  {id:"m38", name:"Chlorhexidine Mouthwash", generic:"Chlorhexidine Gluconate", category:"Dental & Oral", rx:false, form:"Bottle · 150ml", base:95},
  // Cold & Flu
  {id:"m39", name:"Vicks Action 500", generic:"Paracetamol + Phenylephrine", category:"Cold & Flu", rx:false, form:"Tablet · strip of 10", base:35},
  {id:"m40", name:"Benadryl Cough Syrup", generic:"Diphenhydramine", category:"Cold & Flu", rx:false, form:"Syrup · 100ml bottle", base:110},
  {id:"m41", name:"Sinarest Tablet", generic:"Paracetamol + Cetirizine + Phenylephrine", category:"Cold & Flu", rx:false, form:"Tablet · strip of 10", base:28},
  // Women's Health
  {id:"m42", name:"Meftal Spas Tablet", generic:"Mefenamic Acid + Dicyclomine", category:"Women's Health", rx:false, form:"Tablet · strip of 10", base:40},
  {id:"m43", name:"Folic Acid 5mg", generic:"Folic Acid", category:"Women's Health", rx:false, form:"Tablet · strip of 20", base:18},
  {id:"m44", name:"i-Pill Emergency Contraceptive", generic:"Levonorgestrel", category:"Women's Health", rx:false, form:"Tablet · single dose", base:75},
  // Baby & Child
  {id:"m45", name:"Paracetamol Pediatric Syrup", generic:"Paracetamol", category:"Baby & Child", rx:false, form:"Syrup · 60ml bottle", base:38},
  {id:"m46", name:"Gripe Water", generic:"Dill Oil Formulation", category:"Baby & Child", rx:false, form:"Bottle · 130ml", base:65},
  // Mental Health
  {id:"m47", name:"Sertraline 50mg", generic:"Sertraline", category:"Mental Health", rx:true, form:"Tablet · strip of 10", base:88},
  {id:"m48", name:"Alprazolam 0.25mg", generic:"Alprazolam", category:"Mental Health", rx:true, form:"Tablet · strip of 10", base:32},
  {id:"m49", name:"Escitalopram 10mg", generic:"Escitalopram", category:"Mental Health", rx:true, form:"Tablet · strip of 10", base:105},
  // First Aid
  {id:"m50", name:"Betadine Antiseptic Solution", generic:"Povidone-Iodine", category:"First Aid", rx:false, form:"Bottle · 100ml", base:85},
  {id:"m51", name:"Band-Aid Strips", generic:"Adhesive Bandages", category:"First Aid", rx:false, form:"Box · 40 strips", base:55},
  {id:"m52", name:"Burnol Cream", generic:"Povidone-Iodine Burn Cream", category:"First Aid", rx:false, form:"Cream · 20g tube", base:48},
  // Ayurvedic & Herbal
  {id:"m53", name:"Dabur Chyawanprash", generic:"Herbal Immunity Blend", category:"Ayurvedic & Herbal", rx:false, form:"Jar · 500g", base:220},
  {id:"m54", name:"Ashwagandha Capsules", generic:"Withania Somnifera", category:"Ayurvedic & Herbal", rx:false, form:"Capsule · bottle of 60", base:340},
  {id:"m55", name:"Himalaya Liv.52", generic:"Herbal Liver Support", category:"Ayurvedic & Herbal", rx:false, form:"Tablet · strip of 20", base:105},
];


/* Delhi NCR reference point, used as the default search centre until a
   visitor shares (or picks) a location. */
const DELHI_CENTER = { lat:28.6139, lng:77.2090 };

/* Curated pharmacy network — this is the app's reliable, always-available
   base layer. It works instantly with zero network dependency, which
   matters because live third-party lookups (below) can be blocked by
   whatever browser/preview this page runs inside. Real chain names and
   approximate branch coordinates across Delhi NCR; treat as illustrative
   rather than an exact street address for any single branch. */
const CURATED_PHARMACIES = [
  {id:"c1",  name:"Apollo Pharmacy",       area:"Connaught Place",  lat:28.6315, lng:77.2167, rating:"4.6", open24:true,  source:"curated"},
  {id:"c2",  name:"MedPlus",               area:"Karol Bagh",       lat:28.6519, lng:77.1909, rating:"4.3", open24:false, source:"curated"},
  {id:"c3",  name:"Wellness Forever",      area:"Lajpat Nagar",     lat:28.5677, lng:77.2431, rating:"4.4", open24:false, source:"curated"},
  {id:"c4",  name:"Netmeds Store",         area:"Saket",            lat:28.5245, lng:77.2066, rating:"4.1", open24:true,  source:"curated"},
  {id:"c5",  name:"Guardian Pharmacy",     area:"Vasant Kunj",      lat:28.5244, lng:77.1591, rating:"4.5", open24:false, source:"curated"},
  {id:"c6",  name:"Frank Ross Pharmacy",   area:"Hauz Khas",        lat:28.5494, lng:77.2001, rating:"4.2", open24:false, source:"curated"},
  {id:"c7",  name:"Religare SwifChem",     area:"Rohini",           lat:28.7495, lng:77.1200, rating:"4.0", open24:true,  source:"curated"},
  {id:"c8",  name:"Dawaa Dukan",           area:"Dwarka",           lat:28.5921, lng:77.0460, rating:"4.3", open24:false, source:"curated"},
  {id:"c9",  name:"Truemeds",              area:"Janakpuri",        lat:28.6219, lng:77.0878, rating:"4.2", open24:false, source:"curated"},
  {id:"c10", name:"Sastasundar Pharmacy",  area:"Pitampura",        lat:28.6980, lng:77.1315, rating:"4.1", open24:true,  source:"curated"},
  {id:"c11", name:"1mg Store",             area:"Mayur Vihar",      lat:28.6096, lng:77.2955, rating:"4.4", open24:false, source:"curated"},
  {id:"c12", name:"Noida Meds Point",      area:"Noida Sector 18",  lat:28.5700, lng:77.3230, rating:"4.3", open24:true,  source:"curated"},
];

/* Working pharmacy list shown in the UI. Starts as the curated network
   (so the app is fully usable immediately) and may gain extra, real
   OpenStreetMap-sourced entries in the background — see
   enrichWithLivePharmacies(). */
let PHARMACIES = CURATED_PHARMACIES.map(p=>({...p}));

/* Quick-pick localities for manual location entry — instant, no network
   required. "Detect my location" (below) drives real GPS detection. */
const LOCALITIES = [
  {label:"Delhi (city center)", lat:28.6139, lng:77.2090},
  {label:"Connaught Place",     lat:28.6315, lng:77.2167},
  {label:"Karol Bagh",          lat:28.6519, lng:77.1909},
  {label:"Lajpat Nagar",        lat:28.5677, lng:77.2431},
  {label:"Saket",               lat:28.5245, lng:77.2066},
  {label:"Vasant Kunj",         lat:28.5244, lng:77.1591},
  {label:"Hauz Khas",           lat:28.5494, lng:77.2001},
  {label:"Rohini",              lat:28.7495, lng:77.1200},
  {label:"Dwarka",              lat:28.5921, lng:77.0460},
  {label:"Janakpuri",           lat:28.6219, lng:77.0878},
  {label:"Noida Sector 18",     lat:28.5700, lng:77.3230},
  {label:"Gurugram Cyber Hub",  lat:28.4950, lng:77.0890},
];

/* Haversine great-circle distance in kilometres. */
function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
/* Distance from the visitor (or Delhi's centre, until they share a location) to a pharmacy. */
function distanceKm(ph){
  const from = state.userCoords || DELHI_CENTER;
  return haversineKm(from.lat, from.lng, ph.lat, ph.lng);
}
function distanceLabel(ph){ return distanceKm(ph).toFixed(1) + " km"; }

/* stock[pharmacyId][medicineId] = { qty, price } | null (out of stock).
   Rebuilt every time PHARMACIES changes. There is no public API for
   real-time pharmacy inventory, so quantities and prices are simulated —
   deterministically, from each pharmacy's own id, so they stay stable
   while you browse. Coverage is intentionally high (~94%) so nearly
   every medicine shows up at nearly every pharmacy, the way a real
   metro-area pharmacy network would look; this is disclosed in the
   footer since it's still simulated data. */
let STOCK = {};
function buildStock(){
  STOCK = {};
  PHARMACIES.forEach(ph=>{
    STOCK[ph.id] = {};
    const localRand = mulberry32(hashSeed(ph.id));
    MEDICINES.forEach(med=>{
      const inStock = localRand() < 0.94;
      if(!inStock){ STOCK[ph.id][med.id] = null; return; }
      const priceFactor = 0.88 + localRand()*0.4; // 0.88x – 1.28x base price
      const price = Math.max(5, Math.round((med.base * priceFactor)/5)*5);
      const qty = Math.floor(localRand()*38)+2;
      STOCK[ph.id][med.id] = { qty, price };
    });
  });
}
function hashSeed(str){
  let h = 0;
  for(const c of str) h = (h*31 + c.charCodeAt(0)) | 0;
  return h;
}

/* deterministic mini price-trend (7 points) for the premium sparkline */
function priceTrend(med){
  let seed = 0; for(const c of med.id) seed += c.charCodeAt(0);
  const r = mulberry32(seed*97);
  const points = [];
  let v = med.base;
  for(let i=0;i<7;i++){ v = v + (r()-0.5)*med.base*0.12; points.push(Math.max(5,v)); }
  return points;
}

/* ---------------------------------------------------------------------------
   2a. API KEY CONFIG — Geoapify (https://www.geoapify.com)
   Free tier: 3,000 requests/day, no credit card required.
   1. Sign up at myprojects.geoapify.com and create a project.
   2. Copy the API key from your project dashboard.
   3. Paste it below.
   This single key powers BOTH the exact reverse-geocoded address of the
   visitor's current location AND the live nearby-pharmacy search — both
   noticeably more accurate/reliable than the free keyless OSM chain.
   If left blank, the app automatically falls back to that free chain
   (Nominatim + Overpass, further down this file) — nothing breaks.
   ------------------------------------------------------------------------- */
const GEOAPIFY_API_KEY = "007bf8c2dad94944977f0c1d0bafa6ae"; // <-- paste your free Geoapify key here

/* Exact street-level address for a set of coordinates, via Geoapify's
   Reverse Geocoding API. Returns null (not a fallback string) so callers
   can tell "Geoapify wasn't used/failed" apart from "Geoapify tried and
   truly found nothing" — that's what lets reverseGeocodeLabel() below
   drop cleanly to the OSM chain only when it needs to. */
async function geoapifyReverseGeocode(lat, lng){
  if(!GEOAPIFY_API_KEY) return null;
  try{
    const res = await fetchWithTimeout(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${GEOAPIFY_API_KEY}`,
      {}, 5000
    );
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const r = data.results && data.results[0];
    if(!r) return null;
    return {
      label: r.suburb || r.district || r.city_district || r.city || r.county || "Your current location",
      fullAddress: r.formatted || null,
    };
  } catch(err){
    console.warn("Geoapify reverse geocode failed:", err);
    return null;
  }
}

/* Real nearby pharmacies via Geoapify's Places API (healthcare.pharmacy
   category) — genuine, actively-maintained business listings, generally
   far more complete and accurately-located than crowdsourced OSM tags.
   Returns null if Geoapify itself couldn't be reached (falls back to the
   OSM chain), or [] if it WAS reached but genuinely found nothing at that
   radius (caller should widen the radius, not fall back to OSM). */
async function geoapifyNearbyPharmacies(coords, radius){
  if(!GEOAPIFY_API_KEY) return null;
  try{
    const url = `https://api.geoapify.com/v2/places?categories=healthcare.pharmacy&filter=circle:${coords.lng},${coords.lat},${radius}&bias=proximity:${coords.lng},${coords.lat}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetchWithTimeout(url, {}, 6000);
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const feats = data.features || [];
    return feats.map(f=>{
      const p = f.properties || {};
      const lat = p.lat ?? f.geometry?.coordinates?.[1];
      const lon = p.lon ?? f.geometry?.coordinates?.[0];
      if(lat==null || lon==null || !p.name) return null;
      return {
        id: "geoapify-" + (p.place_id || (p.name + lat.toFixed(4) + lon.toFixed(4))),
        name: p.name,
        area: p.suburb || p.district || p.city || "Nearby",
        address: p.formatted || p.address_line1 || null,
        lat, lng: lon,
        rating: (3.6 + mulberry32(hashSeed("geo"+(p.place_id||p.name)))()*1.3).toFixed(1),
        open24: /24\s*\/\s*7|24 hours/i.test(p.opening_hours || ""),
        phone: (p.contact && p.contact.phone) || null,
        source: "geoapify",
      };
    }).filter(Boolean)
      .sort((a,b)=> haversineKm(coords.lat,coords.lng,a.lat,a.lng) - haversineKm(coords.lat,coords.lng,b.lat,b.lng))
      .slice(0,20);
  } catch(err){
    console.warn("Geoapify places lookup failed:", err);
    return null;
  }
}

/* ---------------------------------------------------------------------------
   2b. FREE KEYLESS FALLBACK — OpenStreetMap Overpass + Nominatim
   Used automatically whenever GEOAPIFY_API_KEY is blank above, or if a
   Geoapify request itself fails (network/outage) — never on top of a
   successful Geoapify response, so you don't pay for calls you don't need.
   ------------------------------------------------------------------------- */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function overpassQuery(lat, lng, radius){
  return `[out:json][timeout:20];(node["amenity"="pharmacy"](around:${radius},${lat},${lng});way["amenity"="pharmacy"](around:${radius},${lat},${lng});node["healthcare"="pharmacy"](around:${radius},${lat},${lng}););out center 40;`;
}

async function fetchWithTimeout(url, options, ms){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), ms);
  try{
    return await fetch(url, {...options, signal:controller.signal});
  } finally {
    clearTimeout(timer);
  }
}

function parseOverpassElements(elements, coords){
  const seen = new Set();
  const list = [];
  elements.forEach(el=>{
    const tags = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if(lat==null || lon==null) return;
    const name = tags.name || tags["name:en"];
    if(!name) return; // skip unnamed points for a cleaner list
    const key = name + lat.toFixed(4) + lon.toFixed(4);
    if(seen.has(key)) return;
    seen.add(key);
    const area = tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:city"] || tags["addr:street"] || "Nearby";
    const open24 = /24\s*\/\s*7|24 hours/i.test(tags.opening_hours || "");
    list.push({
      id: "osm-" + el.type + el.id,
      name, area, lat, lng: lon,
      rating: (3.6 + mulberry32(hashSeed("osm"+el.id))()*1.3).toFixed(1),
      open24,
      phone: tags.phone || tags["contact:phone"] || null,
      source: "osm",
    });
  });
  return list
    .sort((a,b)=> haversineKm(coords.lat,coords.lng,a.lat,a.lng) - haversineKm(coords.lat,coords.lng,b.lat,b.lng))
    .slice(0,14);
}

/* Best-effort lookup of real nearby pharmacies via OpenStreetMap's
   Overpass API. Tries the primary mirror first, then a second mirror if
   that one fails outright — each with its own short timeout, so the
   whole thing gives up well before it feels stuck. Returns the pharmacy
   list plus a human-readable reason if nothing was found, so failures
   can be shown to the visitor instead of only logged to console. */
/* One pass across all Overpass mirrors at a single radius. Returns as
   soon as one mirror answers with results. */
async function fetchLivePharmaciesAtRadius(coords, radius, viaProxy=false){
  let lastReason = null;
  for(const [i, endpoint] of OVERPASS_ENDPOINTS.entries()){
    const url = viaProxy ? `https://corsproxy.io/?url=${encodeURIComponent(endpoint)}` : endpoint;
    try{
      const res = await fetchWithTimeout(url, {
        method:"POST",
        headers:{"Content-Type":"text/plain"},
        body:"data=" + encodeURIComponent(overpassQuery(coords.lat, coords.lng, radius)),
      }, i === 0 ? 5000 : 4000);
      if(!res.ok){ lastReason = `${endpoint.replace('https://','').split('/')[0]} returned HTTP ${res.status}`; continue; }
      const data = await res.json();
      const pharmacies = parseOverpassElements(data.elements || [], coords);
      if(pharmacies.length) return {pharmacies, reason:null};
      lastReason = "no pharmacies found in OpenStreetMap's data for this area";
    } catch(err){
      // A generic "Failed to fetch" / AbortError here almost always means
      // the request never left the browser — most commonly a Content
      // Security Policy blocking the connection (common in embedded
      // previews/iframes) or the request timing out.
      lastReason = err.name === "AbortError"
        ? `${endpoint.replace('https://','').split('/')[0]} timed out`
        : `browser blocked or couldn't complete the request (${err.message || err.name})`;
      console.warn("Live pharmacy lookup failed:", url, err);
    }
  }
  return {pharmacies:[], reason:lastReason};
}

/* Full lookup: tries a tight radius first (most relevant results for a
   dense city area), and only widens the search if too few pharmacies
   turn up — sparser suburban/rural areas need a bigger net. If every
   direct attempt is blocked (typically a CSP restriction inside an
   embedded preview), makes one last attempt through a public CORS proxy
   before giving up, so "can't reach the API directly" doesn't have to
   mean "no live results at all". */
async function fetchLivePharmacies(coords, startRadius=6000){
  const radii = [startRadius, startRadius*2.5, startRadius*5];

  if(GEOAPIFY_API_KEY){
    let geoapifyReachable = true;
    for(const radius of radii){
      const pharmacies = await geoapifyNearbyPharmacies(coords, radius);
      if(pharmacies === null){ geoapifyReachable = false; break; } // request failed outright — drop to OSM below
      if(pharmacies.length >= 3 || radius === radii[radii.length-1]){
        if(pharmacies.length) return {pharmacies, reason:null};
      }
    }
    if(geoapifyReachable) return {pharmacies:[], reason:"no pharmacies found near this location"};
  }

  // No Geoapify key configured, or the Geoapify request itself failed —
  // fall back to the free, keyless OSM chain so the app still works.
  let lastReason = null;
  let allBlocked = true;
  for(const radius of radii){
    const {pharmacies, reason} = await fetchLivePharmaciesAtRadius(coords, radius);
    if(pharmacies.length >= 3) return {pharmacies, reason:null};
    if(pharmacies.length){ lastReason = null; if(radius === radii[radii.length-1]) return {pharmacies, reason:null}; }
    if(reason && !/no pharmacies found/.test(reason)) { /* still blocked */ } else { allBlocked = false; }
    lastReason = reason;
  }
  if(allBlocked){
    const {pharmacies, reason} = await fetchLivePharmaciesAtRadius(coords, radii[1], true);
    if(pharmacies.length) return {pharmacies, reason:null};
    lastReason = reason || lastReason;
  }
  return {pharmacies:[], reason:lastReason};
}

/* Used for a location the visitor actually gave us (GPS detect or a
   manual area pick): this is the "accurate" path. It looks for real
   pharmacies at those exact coordinates and, if it finds any, REPLACES
   the curated placeholder list with them — because for a location the
   visitor picked on purpose, real nearby results are more useful than a
   generic Delhi NCR network. If the live lookup can't be reached, it
   keeps the curated list but tells the visitor exactly why, instead of
   failing silently. */
async function upgradeWithLivePharmacies(coords, label){
  const {pharmacies:found, reason} = await fetchLivePharmacies(coords);
  // Only act if this is still the location the visitor is looking at.
  if(!state.userCoords || state.userCoords.lat !== coords.lat || state.userCoords.lng !== coords.lng) return;

  if(!found.length){
    toast(`Couldn't load live pharmacy data (${reason || "unknown error"}) — showing our curated Delhi NCR network instead.`, "⚠");
    return;
  }

  PHARMACIES = found;
  buildStock();
  renderTicker();
  renderResults();
  renderNearbyStrip();
  if(state.view==="pharmacies") renderPharmacyView();
  if(state.view==="saved") renderSaved();
  const src = found[0]?.source === "geoapify" ? "Geoapify" : "OpenStreetMap";
  toast(`Updated with ${found.length} real pharmac${found.length===1?'y':'ies'} near ${label}, live from ${src}.`, "📍");
}

/* Used only for the app's default Delhi-centre view on first load: adds
   any extra real pharmacies on top of the curated network rather than
   replacing it (the curated list is already Delhi-appropriate). Silent
   on failure — this one runs automatically on page load, not from a
   visitor action, so it shouldn't pop up an error unprompted. */
async function enrichWithLivePharmacies(coords, label){
  const {pharmacies:found} = await fetchLivePharmacies(coords, 7000);
  if(!found.length) return;
  if(!state.userCoords || state.userCoords.lat !== coords.lat || state.userCoords.lng !== coords.lng) return;

  let added = 0;
  found.forEach(p=>{
    const isDuplicate = PHARMACIES.some(existing => haversineKm(existing.lat, existing.lng, p.lat, p.lng) < 0.25);
    if(!isDuplicate){ PHARMACIES.push(p); added++; }
  });
  if(added === 0) return;

  buildStock();
  renderTicker();
  renderResults();
  renderNearbyStrip();
  if(state.view==="pharmacies") renderPharmacyView();
  if(state.view==="saved") renderSaved();
  toast(`Found ${added} more real pharmac${added===1?'y':'ies'} near ${label}.`, "📍");
}

/* Human-readable label (+ exact formatted address, if available) for a
   set of coordinates. Tries Geoapify first if a key is configured (best
   accuracy), then Nominatim, then BigDataCloud — only falls back to a
   generic label if every provider fails. Returns {label, fullAddress}. */
async function reverseGeocodeLabel(lat, lng){
  const viaGeoapify = await geoapifyReverseGeocode(lat, lng);
  if(viaGeoapify) return viaGeoapify;

  try{
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14`,
      {headers:{"Accept":"application/json"}}, 5000
    );
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const a = data.address || {};
    const label = a.suburb || a.neighbourhood || a.city_district || a.town || a.city;
    if(label) return {label, fullAddress: data.display_name || null};
  } catch(err){
    console.warn("Nominatim reverse geocode failed, trying fallback:", err);
  }
  try{
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      {}, 5000
    );
    if(!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return {
      label: data.locality || data.city || data.principalSubdivision || "Your current location",
      fullAddress: null,
    };
  } catch(err){
    console.warn("Fallback reverse geocode also failed:", err);
    return {label: "Your current location", fullAddress: null};
  }
}

/* ---------------------------------------------------------------------------
   3. APP STATE
   ------------------------------------------------------------------------- */
const state = {
  view: "search",
  query: "",
  activeCategory: null,
  rxFilter: "all",
  maxPrice: 700,
  inStockOnly: false,
  open24Only: false,
  sort: "relevance",
  saved: new Set(),
  compare: new Set(),
  premium: false,
  userCoords: null,
  locationLabel: null,
  locationIsUser: false,
  locationAccuracy: null,
  locationFullAddress: null,
  maxRadius: 0,
  pharmaciesLoading: false,
};

const FREE_SAVE_LIMIT = 3;
const FREE_COMPARE_LIMIT = 2;

/* ---------------------------------------------------------------------------
   4. HELPERS
   ------------------------------------------------------------------------- */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function medById(id){ return MEDICINES.find(m=>m.id===id); }
function pharmById(id){ return PHARMACIES.find(p=>p.id===id); }

function stockEntriesFor(medId){
  return PHARMACIES.map(ph => ({ pharmacy: ph, stock: STOCK[ph.id][medId] }));
}
function lowestPrice(medId){
  const prices = stockEntriesFor(medId).filter(e=>e.stock).map(e=>e.stock.price);
  return prices.length ? Math.min(...prices) : null;
}
function inStockCount(medId){
  return stockEntriesFor(medId).filter(e=>e.stock).length;
}
function currency(n){ return "₹" + n.toLocaleString("en-IN"); }

function toast(msg, icon="✓"){
  const stack = $("#toastStack");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity="0"; el.style.transition="opacity .3s"; setTimeout(()=>el.remove(),300); }, 3200);
}

/* ---------------------------------------------------------------------------
   5. RENDER: category chips
   ------------------------------------------------------------------------- */
function renderCategoryChips(){
  const wrap = $("#categoryChips");
  wrap.innerHTML = CATEGORIES.map(c =>
    `<span class="chip${state.activeCategory===c?' active':''}" data-cat="${c}">${c}</span>`
  ).join("");
  $$(".chip[data-cat]", wrap).forEach(chip=>{
    chip.addEventListener("click", ()=>{
      state.activeCategory = state.activeCategory === chip.dataset.cat ? null : chip.dataset.cat;
      renderCategoryChips();
      renderResults();
    });
  });
}

/* ---------------------------------------------------------------------------
   6. RENDER: search suggestions
   ------------------------------------------------------------------------- */
/* Live lookup against RxNorm (part of the U.S. National Library of
   Medicine, free, no API key, CORS-enabled) — returns REAL drug names
   that exist in medical databases, for anything the visitor searches that
   isn't in the ~55-item curated catalog above. This can't return Indian
   retail stock or pricing (no public API anywhere provides that), so
   results are shown as "found in the drug database" with a direct link to
   check real live price/stock on an actual Indian pharmacy site — that's
   the only place that real-time number genuinely lives. */
async function liveMedicineLookup(query){
  try{
    const res = await fetchWithTimeout(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`,
      {}, 5000
    );
    if(!res.ok) return [];
    const data = await res.json();
    const groups = data?.drugGroup?.conceptGroup || [];
    const names = new Set();
    groups.forEach(g => (g.conceptProperties||[]).forEach(c => names.add(c.name)));
    return Array.from(names).slice(0,6);
  } catch(err){
    console.warn("Live medicine lookup failed:", err);
    return [];
  }
}

function pharmacySearchLinks(name){
  const q = encodeURIComponent(name);
  return [
    {label:"1mg", url:`https://www.1mg.com/search/all?name=${q}`},
    {label:"PharmEasy", url:`https://pharmeasy.in/search/all?name=${q}`},
    {label:"Netmeds", url:`https://www.netmeds.com/catalogsearch/result?q=${q}`},
    {label:"Apollo 24|7", url:`https://www.apollo247.com/search-medicine/${q}`},
  ];
}

let suggestToken = 0;
function renderSuggestions(query){
  const list = $("#suggestList");
  if(!query){ list.classList.remove("show"); list.innerHTML=""; return; }
  const q = query.toLowerCase();
  const matches = MEDICINES.filter(m =>
    m.name.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  ).slice(0,6);

  const renderList = (liveNames) => {
    const liveHTML = liveNames && liveNames.length ? `
      <div class="suggest-item" style="cursor:default;opacity:.7;font-size:12px;">
        <span>Also found in live drug database (RxNorm)</span>
      </div>
      ${liveNames.map(n => `
      <div class="suggest-item" data-live="${n.replace(/"/g,'&quot;')}">
        <span>${n}</span>
        <small>Not in local catalog · check live price ↗</small>
      </div>`).join("")}` : "";
    if(!matches.length && !liveHTML){ list.classList.remove("show"); list.innerHTML=""; return; }
    list.innerHTML = matches.map(m => `
      <div class="suggest-item" data-id="${m.id}">
        <span>${m.name}</span>
        <small>${m.category} · from ${currency(lowestPrice(m.id) ?? m.base)}</small>
      </div>`).join("") + liveHTML;
    list.classList.add("show");
    $$(".suggest-item[data-id]", list).forEach(item=>{
      item.addEventListener("click", ()=>{
        openDetail(item.dataset.id);
        list.classList.remove("show");
      });
    });
    $$(".suggest-item[data-live]", list).forEach(item=>{
      item.addEventListener("click", ()=>{
        window.open(pharmacySearchLinks(item.dataset.live)[0].url, "_blank", "noopener");
      });
    });
  };

  renderList(null);

  // Only hit the live API once the visitor has typed enough to be
  // meaningful, and only if the local catalog didn't already give a
  // strong match — avoids a network call on every keystroke.
  if(query.length >= 3 && matches.length < 3){
    const myToken = ++suggestToken;
    liveMedicineLookup(query).then(liveNames => {
      if(myToken !== suggestToken) return; // a newer keystroke superseded this
      renderList(liveNames);
    });
  }
}

/* ---------------------------------------------------------------------------
   7. RENDER: results grid
   ------------------------------------------------------------------------- */
function filteredMedicines(){
  let list = MEDICINES.filter(m=>{
    if(state.query){
      const q = state.query.toLowerCase();
      if(!(m.name.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))) return false;
    }
    if(state.activeCategory && m.category !== state.activeCategory) return false;
    if(state.rxFilter==="otc" && m.rx) return false;
    if(state.rxFilter==="rx" && !m.rx) return false;
    const low = lowestPrice(m.id);
    if(low !== null && low > state.maxPrice) return false;
    if(state.inStockOnly && inStockCount(m.id)===0) return false;
    if(state.open24Only){
      const has24 = stockEntriesFor(m.id).some(e=>e.stock && e.pharmacy.open24);
      if(!has24) return false;
    }
    if(state.maxRadius > 0){
      const withinRadius = stockEntriesFor(m.id).some(e=>e.stock && distanceKm(e.pharmacy) <= state.maxRadius);
      if(!withinRadius) return false;
    }
    return true;
  });

  if(state.sort==="price-low") list = list.slice().sort((a,b)=>(lowestPrice(a.id)??1e9)-(lowestPrice(b.id)??1e9));
  else if(state.sort==="price-high") list = list.slice().sort((a,b)=>(lowestPrice(b.id)??-1)-(lowestPrice(a.id)??-1));
  else if(state.sort==="availability") list = list.slice().sort((a,b)=>inStockCount(b.id)-inStockCount(a.id));
  else if(state.sort==="distance") list = list.slice().sort((a,b)=>nearestDistance(a.id)-nearestDistance(b.id));

  return list;
}

/* Distance to the closest pharmacy that currently has this medicine in stock. */
function nearestDistance(medId){
  const distances = stockEntriesFor(medId).filter(e=>e.stock).map(e=>distanceKm(e.pharmacy));
  return distances.length ? Math.min(...distances) : Infinity;
}
function nearestPharmacy(medId){
  const entries = stockEntriesFor(medId).filter(e=>e.stock);
  if(!entries.length) return null;
  return entries.reduce((best,e)=> distanceKm(e.pharmacy) < distanceKm(best.pharmacy) ? e : best);
}

function medCardHTML(m){
  const low = lowestPrice(m.id);
  const count = inStockCount(m.id);
  const saved = state.saved.has(m.id);
  const nearest = nearestPharmacy(m.id);
  return `
  <article class="med-card" data-id="${m.id}">
    <div class="med-card-top">
      <div class="med-card-row">
        <div>
          <p class="med-name">${m.name}</p>
          <p class="med-generic">${m.generic}</p>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="save-btn${state.compare.has(m.id)?' saved':''}" data-compare="${m.id}" title="Add to compare">⇄</button>
          <button class="save-btn${saved?' saved':''}" data-save="${m.id}" title="Save medicine">${saved?'♥':'♡'}</button>
        </div>
      </div>
      
      <div class="badge-row">
        <span class="badge ${m.rx?'rx':'otc'}">${m.rx?'Rx required':'OTC'}</span>
        <span class="badge cat">${m.category}</span>
        ${m.genericOf ? `<span class="badge cat">Branded</span>` : ''}
      </div>
    </div>
    <div class="med-perf"></div>
    <div class="med-card-bottom">
      <div class="price-row">
        <div class="lowest">${low!==null?currency(low):'—'}<small>${m.form}</small></div>
        <div class="avail-tag">${count>0?`<b>${count}</b>/${PHARMACIES.length} nearby`:'Out of stock'}</div>
      </div>
      ${nearest ? `<p class="nearest-line">📍 ${distanceLabel(nearest.pharmacy)} away · ${nearest.pharmacy.name}</p>` : ''}
      <button class="btn primary" data-view="${m.id}">View availability</button>
    </div>
  </article>`;
}

function renderResults(){
  if(state.pharmaciesLoading){
    $("#resultsGrid").innerHTML = Array.from({length:6}).map(()=>`<div class="med-card skeleton"></div>`).join("");
    $("#resultsCount").textContent = "Finding nearby pharmacies…";
    return;
  }
  const list = filteredMedicines();
  $("#resultsGrid").innerHTML = list.length
    ? list.map(medCardHTML).join("")
    : `<div class="empty-state" style="grid-column:1/-1;"><b>No medicines match those filters</b>Try widening your price range or clearing a filter.</div>`;
  $("#resultsCount").textContent = `${list.length} result${list.length!==1?'s':''}`;
  $("#resultsTitle").textContent = state.query ? `Results for “${state.query}”` : (state.activeCategory || "All medicines");
  bindCardEvents();
}

function bindCardEvents(){
  $$("[data-view]").forEach(btn=>btn.addEventListener("click", ()=>openDetail(btn.dataset.view)));
  $$(".med-card").forEach(card=>card.addEventListener("click", (e)=>{
    if(e.target.closest("[data-save]")||e.target.closest("[data-view]")) return;
    openDetail(card.dataset.id);
  }));
  $$("[data-save]").forEach(btn=>btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    toggleSave(btn.dataset.save);
  }));
  $$("[data-compare]").forEach(btn=>btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    toggleCompare(btn.dataset.compare);
    btn.classList.toggle("saved", state.compare.has(btn.dataset.compare));
  }));
}


/* ---------------------------------------------------------------------------
   8. SAVE / COMPARE (in-memory, session-only — mirrors free vs premium tiers)
   ------------------------------------------------------------------------- */
function toggleSave(id){
  if(!state.saved.has(id) && !state.premium && state.saved.size>=FREE_SAVE_LIMIT){
    toast(`Free plan saves up to ${FREE_SAVE_LIMIT} medicines. Go Premium for unlimited saves.`, "✦");
    return;
  }
  state.saved.has(id) ? state.saved.delete(id) : state.saved.add(id);
  updateCounts();
  renderResults();
  if(state.view==="saved") renderSaved();
}

function toggleCompare(id){
  if(!state.compare.has(id) && !state.premium && state.compare.size>=FREE_COMPARE_LIMIT){
    toast(`Free plan compares up to ${FREE_COMPARE_LIMIT} medicines. Go Premium to compare more.`, "✦");
    return;
  }
  state.compare.has(id) ? state.compare.delete(id) : state.compare.add(id);
  updateCounts();
  renderTray();
  if(state.view==="compare") renderCompareView();
}

function updateCounts(){
  $("#navSavedCount").textContent = state.saved.size;
  $("#navCompareCount").textContent = state.compare.size;
}

function renderTray(){
  const tray = $("#compareTray");
  if(state.compare.size===0){ tray.classList.remove("show"); return; }
  tray.classList.add("show");
  $("#trayItems").innerHTML = Array.from(state.compare).map(id=>{
    const m = medById(id);
    return `<span class="tray-chip">${m.name}<button data-untray="${id}">×</button></span>`;
  }).join("");
  $$("[data-untray]", tray).forEach(b=>b.addEventListener("click", ()=>toggleCompare(b.dataset.untray)));
}

/* ---------------------------------------------------------------------------
   9. DETAIL DRAWER
   ------------------------------------------------------------------------- */
let drawerSort = "distance";

function openDetail(id){
  const m = medById(id);
  const overlay = $("#drawerOverlay");
  const drawer = $("#drawer");
  const generic = m.genericOf ? medById(m.genericOf) : (MEDICINES.find(x=>x.genericOf && medById(x.genericOf)?.generic===m.generic && x.id!==m.id && !x.genericOf) || null);
  const cheaperGeneric = m.genericOf ? medById(m.genericOf) : null;

  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <p class="med-generic" style="margin:0 0 4px;">${m.category} · ${m.form}</p>
        <h2 style="font-family:var(--font-display);font-size:23px;margin:0;font-weight:600;">${m.name}</h2>
        <div class="badge-row" style="margin-top:8px;">
          <span class="badge ${m.rx?'rx':'otc'}">${m.rx?'Rx required':'OTC'}</span>
          <span class="badge cat">Generic: ${m.generic}</span>
        </div>
      </div>
      <button class="drawer-close" id="closeDrawer">✕</button>
    </div>
    <div class="drawer-body">

      ${cheaperGeneric ? `
      <div class="generic-callout">
        <span>Generic <b>${cheaperGeneric.name}</b> has the same active ingredient for less.</span>
        <button class="btn small" data-view="${cheaperGeneric.id}">Switch</button>
      </div>` : ``}

      <h4>7-day price trend ${state.premium ? '' : '· Premium'}</h4>
      <div class="trend-box ${state.premium ? '' : 'locked'}">
        ${sparklineSVG(priceTrend(m))}
        ${state.premium ? '' : `<div class="lock-overlay"><b>🔒 Unlock price history</b><span>See where prices are trending before you buy.</span><button class="btn small primary" id="unlockTrend">Try Premium</button></div>`}
      </div>

      <h4>Availability at nearby pharmacies <span style="font-weight:400;color:var(--ink-faint);font-size:12px;">· estimated, not live</span></h4>
      <div class="pharm-controls">
        <span class="chip ${drawerSort==='distance'?'active':''}" data-dsort="distance">Nearest</span>
        <span class="chip ${drawerSort==='price'?'active':''}" data-dsort="price">Cheapest</span>
        <span class="chip ${drawerSort==='rating'?'active':''}" data-dsort="rating">Top rated</span>
      </div>
      <div class="pharm-list" id="pharmList"></div>

      <h4>Check today's real price &amp; stock</h4>
      <p style="font-size:12.5px;color:var(--ink-soft);margin:-6px 0 10px;">No public API exposes live pharmacy inventory or pricing — these open a real search on each retailer's own site.</p>
      <div class="badge-row">
        ${pharmacySearchLinks(m.name).map(l=>`<a class="btn small" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("")}
      </div>
    </div>
  `;

  renderPharmList(m);

  overlay.classList.add("show");
  $("#closeDrawer").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", (e)=>{ if(e.target===overlay) closeDrawer(); });
  $$("[data-dsort]").forEach(chip=>chip.addEventListener("click", ()=>{
    drawerSort = chip.dataset.dsort;
    $$("[data-dsort]").forEach(c=>c.classList.toggle("active", c.dataset.dsort===drawerSort));
    renderPharmList(m);
  }));
  const genericBtn = $("[data-view]", drawer);
  if(genericBtn) genericBtn.addEventListener("click", ()=>openDetail(genericBtn.dataset.view));
  const unlockBtn = $("#unlockTrend");
  if(unlockBtn) unlockBtn.addEventListener("click", activatePremium);
}

function sparklineSVG(points){
  const w=260,h=54,max=Math.max(...points),min=Math.min(...points);
  const norm = points.map((p,i)=>{
    const x = (i/(points.length-1))*w;
    const y = h - ((p-min)/((max-min)||1))*h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const change = (((points[points.length-1]-points[0])/points[0])*100).toFixed(1);
  const up = change >= 0;
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible;">
      <polyline points="${norm}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <p style="font-family:var(--font-mono);font-size:12px;margin:8px 0 0;color:${up?'var(--alert)':'var(--accent)'};">
      ${up?'▲':'▼'} ${Math.abs(change)}% over 7 days
    </p>`;
}

function renderPharmList(m){
  let entries = stockEntriesFor(m.id);
  if(drawerSort==="distance") entries = entries.slice().sort((a,b)=>distanceKm(a.pharmacy)-distanceKm(b.pharmacy));
  if(drawerSort==="price") entries = entries.slice().sort((a,b)=>(a.stock?a.stock.price:1e9)-(b.stock?b.stock.price:1e9));
  if(drawerSort==="rating") entries = entries.slice().sort((a,b)=>b.pharmacy.rating-a.pharmacy.rating);

  $("#pharmList").innerHTML = entries.map(e=>{
    const inStock = !!e.stock;
    return `
    <div class="pharm-row ${inStock?'':'out'}">
      <div class="pharm-info">
        <b><span class="stock-dot"></span>${e.pharmacy.name}</b>
        <div class="pharm-meta">
          <span>${e.pharmacy.area}</span>
          <span>${distanceLabel(e.pharmacy)}</span>
          <span class="stars">★ ${e.pharmacy.rating}</span>
          ${e.pharmacy.open24?'<span>24×7</span>':''}
        </div>
      </div>
      <div class="pharm-price">
        ${inStock
          ? `<b>${currency(e.stock.price)}</b><span>${e.stock.qty} in stock</span>`
          : `<button class="btn small" data-notify="${m.id}|${e.pharmacy.id}">Notify me</button>`}
      </div>
    </div>`;
  }).join("");

  $$("[data-notify]").forEach(btn=>btn.addEventListener("click", ()=>{
    const [medId, phId] = btn.dataset.notify.split("|");
    toast(`We'll alert you when ${medById(medId).name} is back at ${pharmById(phId).name}${state.premium?' — instantly.':' within 24h.'}`, "🔔");
  }));
}

function closeDrawer(){ $("#drawerOverlay").classList.remove("show"); }

/* Footer stats reflect the actual catalog size rather than a hardcoded
   guess, and the copyright year updates itself. */
function renderFooterMeta(){
  const medsEl = $("#footerStatMeds");
  const catsEl = $("#footerStatCats");
  const yearEl = $("#footerYear");
  if(medsEl) medsEl.textContent = MEDICINES.length + "+";
  if(catsEl) catsEl.textContent = CATEGORIES.length;
  if(yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------------------------
   9b. FOOTER INFO DRAWER — reuses the same slide-out drawer as medicine
   detail, just filled with static explainer content instead of pharmacy
   data. Keeps "How this works / Privacy / Terms / Disclaimer" honest and
   specific to what this demo actually does, rather than dead links.
   ------------------------------------------------------------------------- */
const INFO_CONTENT = {
  how: {
    title: "How Rx Finder works",
    body: `
      <p>Rx Finder is a medicine availability &amp; price-compare for Delhi NCR. Three things happen when you search:</p>
      <h5>1. We find pharmacies near you</h5>
      <p>If a <a href="https://www.geoapify.com" target="_blank" rel="noopener">Geoapify</a> API key is configured, real pharmacy listings come from its Places API. Otherwise the app falls back automatically to <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> data (Overpass + Nominatim) — both genuinely live, keyless, and free.</p>
      <h5>2. We match your search to real medicines</h5>
      <p>The curated catalog covers ~${MEDICINES.length} common Indian OTC and prescription medicines. Anything not in that list is looked up live against <a href="https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html" target="_blank" rel="noopener">RxNorm</a>, a real drug database maintained by the U.S. National Library of Medicine.</p>
      <h5>3. We estimate stock &amp; price</h5>
      <p>No public API anywhere exposes real-time per-pharmacy inventory or pricing, so these numbers are simulated for demonstration. Every medicine page links out to real pharmacy platforms for the actual current price.</p>`
  },
  accuracy: {
    title: "Why prices are estimated",
    body: `
      <p>Medicine prices displayed on this website are approximate estimates and are provided for informational purposes only.<br><br> Actual prices may vary depending on: </p>
      
      <ul>
        <li>Pharmacy location</li>
        <li>Medicine names, generics and dosage forms — real drugs, cross-checked against RxNorm where possible</li>
        <li>Distance calculations — computed live from your actual coordinates</li>
      </ul>
      <h5>What's simulated</h5>
      <ul>
        <li>Stock quantity at a given pharmacy</li>
        <li>Price at a given pharmacy</li>
      </ul>
      <p>For a genuine live number, use the "Check today's real price &amp; stock" links on any medicine page — those open a real search on an actual pharmacy retailer's site.</p>`
  },
  privacy: {
    title: "Privacy",
    body: `
    <h5>Privacy Policy</h5>  
    <p>At Medicine Availability Finder, protecting your privacy is one of our priorities. This Privacy Policy explains how we collect, use, and safeguard the information you provide while using our platform.</p>
    <h5>Information we collect</h5>
    <p>Depending on the features you use, we may collect:</p>
      <ul>
        <li>Your approximate or current location (only with your explicit permission)</li>
        <li>Medicine names entered in the search bar</li>
        <li>Basic browser and device information necessary for website functionality</li>
      </ul>
      <p>We do not collect sensitive personal or medical information without your knowledge.</p>
      <h5> Third-Party Services</h5>
      <p>Our website may use external APIs such as maps or geolocation services. These services have their own privacy policies.</p>`
  },
  terms: {
    title: "Terms of use",
    body: `
      <p>Rx Finder is provided as a demonstration tool for browsing medicine information and pharmacy locations. It is not a licensed pharmacy, does not sell medicines, and does not guarantee the accuracy of any stock, price, or rating shown.</p>
      <p>Pharmacy location data is sourced from third-party APIs (Geoapify and/or OpenStreetMap) under their respective terms; medicine reference data is sourced from RxNorm (U.S. National Library of Medicine). This app is not affiliated with, and does not claim endorsement from, any pharmacy or brand named within it.</p>
      <p>Use of this app is at your own discretion.</p>`
  },
  disclaimer: {
    title: "Medical disclaimer",
    body: `
      <p>Rx Finder is an information tool, not a medical service. It does not provide medical advice, diagnosis, or treatment recommendations.</p>
      <ul>
        <li>Always confirm dosage, interactions, and suitability with a licensed pharmacist or doctor before taking any medicine.</li>
        <li>Never delay seeking medical care because of information (or a lack of it) shown in this app.</li>
        <li>Stock and pricing figures shown here are estimated, not live — confirm directly with a pharmacy before travelling to buy something specific.</li>
      </ul>`
  },
};

function openInfoDrawer(key){
  const info = INFO_CONTENT[key];
  if(!info) return;
  const overlay = $("#drawerOverlay");
  const drawer = $("#drawer");
  drawer.innerHTML = `
    <div class="drawer-head">
      <h2 style="font-family:var(--font-display);font-size:22px;margin:0;font-weight:600;">${info.title}</h2>
      <button class="drawer-close" id="closeDrawer">✕</button>
    </div>
    <div class="drawer-body">
      <div class="info-drawer-body">${info.body}</div>
    </div>`;
  overlay.classList.add("show");
  $("#closeDrawer").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", (e)=>{ if(e.target===overlay) closeDrawer(); });
}

/* ---------------------------------------------------------------------------
   10. PHARMACIES VIEW
   ------------------------------------------------------------------------- */
function renderPharmacyView(){
  if(!PHARMACIES.length){
    $("#pharmacyGrid").innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><b>No pharmacies to show</b>Set your location above.</div>`;
    return;
  }
  $("#pharmacyGrid").innerHTML = PHARMACIES.slice().sort((a,b)=>distanceKm(a)-distanceKm(b)).map(p=>{
    const stockedMeds = MEDICINES.filter(m=>STOCK[p.id][m.id]).length;
    return `
    <div class="pharmacy-card">
      <div class="top">
        <div>
          <h3>${p.name}</h3>
          <div class="area">${p.area} · ${distanceLabel(p)} away</div>
        </div>
        <span class="badge otc">★ ${p.rating}</span>
      </div>
      <div class="meta">
        <span>${stockedMeds}/${MEDICINES.length} medicines in stock</span>
      </div>
      <div class="meta">
        <span>${p.open24 ? '🕑 Open 24×7' : '🕑 Standard hours'}</span>
      </div>
      <div class="source-tag">${
        p.source === 'geoapify' ? '📍 Live pharmacy · Geoapify Places'
        : p.source === 'osm' ? '📍 Live pharmacy · OpenStreetMap'
        : '🏥 Delhi NCR network · demo pricing'
      }</div>
      ${p.address ? `<div class="area" style="margin-top:4px;font-size:12px;">${p.address}</div>` : ''}
    </div>`;
  }).join("");
}

/* ---------------------------------------------------------------------------
   11. COMPARE VIEW
   ------------------------------------------------------------------------- */
function renderCompareView(){
  $("#compareLimitLabel").textContent = state.premium ? "Unlimited (Premium)" : `Up to ${FREE_COMPARE_LIMIT} on Free plan`;
  const ids = Array.from(state.compare);
  if(ids.length < 2){
    $("#compareContent").innerHTML = `<div class="empty-state"><b>Add two or more medicines to compare</b>Use the ♡ heart or "Compare" tray from any medicine card.</div>`;
    return;
  }
  const meds = ids.map(medById);
  const rows = [
    ["Lowest price", m=>currency(lowestPrice(m.id)??0)],
    ["Average price", m=>{
      const prices = stockEntriesFor(m.id).filter(e=>e.stock).map(e=>e.stock.price);
      return prices.length?currency(Math.round(prices.reduce((a,b)=>a+b,0)/prices.length)):"—";
    }],
    ["Pharmacies with stock", m=>`${inStockCount(m.id)} / ${PHARMACIES.length}`],
    ["Requirement", m=>m.rx?"Prescription":"OTC"],
    ["Category", m=>m.category],
    ["Form", m=>m.form],
  ];
  $("#compareContent").innerHTML = `
    <div class="compare-table-wrap">
      <table class="compare-table">
        <thead><tr><th></th>${meds.map(m=>`<th>${m.name}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map(([label,fn])=>`<tr><td class="metric-label">${label}</td>${meds.map(m=>`<td>${fn(m)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------------------------------------------------------------------------
   12. SAVED VIEW
   ------------------------------------------------------------------------- */
function renderSaved(){
  $("#savedLimitLabel").textContent = state.premium ? "Unlimited (Premium)" : `${state.saved.size}/${FREE_SAVE_LIMIT} used on Free plan`;
  const ids = Array.from(state.saved);
  $("#savedGrid").innerHTML = ids.length
    ? ids.map(id=>medCardHTML(medById(id))).join("")
    : `<div class="empty-state" style="grid-column:1/-1;"><b>Nothing saved yet</b>Tap the ♡ on any medicine to keep track of it here.</div>`;
  bindCardEvents();
}

/* ---------------------------------------------------------------------------
   13. NAVIGATION
   ------------------------------------------------------------------------- */
function switchView(view){
  state.view = view;
  $$(".view").forEach(v=>v.classList.remove("active"));
  $(`#view-${view}`).classList.add("active");
  $$("nav.main-nav button").forEach(b=>b.classList.toggle("active", b.dataset.nav===view));
  if(view==="pharmacies") renderPharmacyView();
  if(view==="compare") renderCompareView();
  if(view==="saved") renderSaved();
  window.scrollTo({top:0, behavior:"smooth"});
}

/* ---------------------------------------------------------------------------
   14. THEME
   ------------------------------------------------------------------------- */
function setTheme(dark){
  document.documentElement.setAttribute("data-theme", dark?"dark":"light");
  $("#themeKnob").textContent = dark ? "☾" : "☀";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", dark?"#0F1512":"#F6F4EE");
}

/* ---------------------------------------------------------------------------
   15. PREMIUM
   ------------------------------------------------------------------------- */
function activatePremium(){
  state.premium = true;
  $("#premiumLabel").textContent = "Premium active";
  $("#premiumToggle").classList.add("is-active");
  closeDrawer();
  toast("Premium activated — unlimited saves, live price trends & instant alerts unlocked.", "✦");
  renderResults();
  if(state.view==="saved") renderSaved();
  if(state.view==="compare") renderCompareView();
}
function deactivatePremium(){
  state.premium = false;
  $("#premiumLabel").textContent = "Try Premium";
  $("#premiumToggle").classList.remove("is-active");
  toast("Back to the Free plan.", "◐");
}

/* ---------------------------------------------------------------------------
   15b. LOCATION — "find medicine near me" (live via OpenStreetMap)
   ------------------------------------------------------------------------- */
function renderLocalityList(){
  $("#localityList").innerHTML = LOCALITIES.map(loc =>
    `<span class="chip" data-locality="${loc.label}">${loc.label}</span>`
  ).join("");
  $$("[data-locality]").forEach(chip=>chip.addEventListener("click", ()=>{
    const loc = LOCALITIES.find(l=>l.label===chip.dataset.locality);
    setLocation({lat:loc.lat, lng:loc.lng}, loc.label, {isUser:true});
  }));
}

function toggleLocationPanel(force){
  const panel = $("#locationPanel");
  const show = force !== undefined ? force : !panel.classList.contains("show");
  panel.classList.toggle("show", show);
}

/* Two-tier GPS fix: try a fresh, high-accuracy reading first (best case,
   real GPS/Wi-Fi positioning chip). If that specifically times out (common
   indoors or on laptops with no GPS hardware — high-accuracy mode waits on
   a GPS lock that never comes), immediately retry once with
   enableHighAccuracy:false so the browser falls back to Wi-Fi/IP-based
   positioning instead of just giving up. maximumAge:0 on both attempts so
   we never silently reuse a stale cached fix from an earlier location. */
function requestGeolocation(){
  const btn = $("#detectBtn");
  if(!("geolocation" in navigator)){
    toast("This browser can't access device location — pick your area instead.", "⚠");
    return;
  }
  if(!window.isSecureContext){
    toast("Device location needs HTTPS (or localhost). Pick your area below instead.", "⚠");
    return;
  }
  if(btn){ btn.disabled = true; btn.textContent = "Detecting…"; }
  const startedAt = Date.now();
  const resetBtn = () => { if(btn){ btn.disabled = false; btn.textContent = "📍 Detect my location"; } };

  const onSuccess = pos => {
    resetBtn();
    const coords = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    const accuracy = pos.coords.accuracy; // metres, as reported by the device/browser

    // Show results immediately with a generic label...
    setLocation(coords, "Your current location", {isUser:true, accuracy});

    // ...then quietly upgrade the label to a real place name (and store
    // the exact formatted address, if the provider returned one) once the
    // reverse-geocode call comes back. Never blocks the UI.
    reverseGeocodeLabel(coords.lat, coords.lng).then(({label, fullAddress})=>{
      const stillSameSpot = state.userCoords && state.userCoords.lat === coords.lat && state.userCoords.lng === coords.lng;
      if(stillSameSpot && label && label !== "Your current location"){
        state.locationLabel = label;
        state.locationFullAddress = fullAddress;
        updateLocationButton(false);
      }
    });
  };

  const onFinalError = err => {
    resetBtn();
    const elapsed = Date.now() - startedAt;
    if(err.code === 1 && elapsed < 800){
      // Fails almost instantly with "denied" — typically means the
      // surrounding page (e.g. an embedded preview) never granted this
      // frame location permission at all, rather than the visitor
      // clicking "block".
      toast("This preview can't access device location (it's running inside a restricted embed). Pick your area below instead.", "⚠");
    } else if(err.code === 1){
      toast("Location permission was denied. Pick your area below to continue.", "⚠");
    } else if(err.code === 2){
      toast("Your position couldn't be determined — try again outdoors or pick your area below.", "⚠");
    } else {
      toast("Location request timed out. Pick your area below instead.", "⚠");
    }
  };

  try{
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      err => {
        // High-accuracy attempt failed. If it was specifically a timeout
        // (code 3), retry once with coarser positioning before giving up —
        // this is what usually rescues desktop browsers with no GPS chip.
        if(err.code === 3){
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            onFinalError,
            {timeout:10000, enableHighAccuracy:false, maximumAge:0}
          );
        } else {
          onFinalError(err);
        }
      },
      {timeout:8000, enableHighAccuracy:true, maximumAge:0}
    );
  } catch(err){
    resetBtn();
    toast("This preview can't access device location. Pick your area below instead.", "⚠");
  }
}

/* Central entry point whenever the visitor's location changes. Always
   shows the curated network instantly first (zero network dependency,
   so this never feels slow or throws an error). For a location the
   visitor actually gave us — GPS detect or a manual pick — it then looks
   for real nearby pharmacies via OpenStreetMap and quietly swaps them in
   if found, so the visitor ends up seeing accurate, real results rather
   than the generic Delhi placeholder, without ever waiting on that
   lookup to see something on screen. */
function setLocation(coords, label, {isUser=false, accuracy=null}={}){
  toggleLocationPanel(false);
  state.userCoords = coords;
  state.locationLabel = label;
  state.locationIsUser = isUser;
  state.locationAccuracy = accuracy;
  state.locationFullAddress = null;
  state.sort = "distance";
  const sortEl = $("#sortSelect");
  if(sortEl) sortEl.value = "distance";

  PHARMACIES = CURATED_PHARMACIES.map(p=>({...p}));
  buildStock();

  updateLocationButton(false);
  renderTicker();
  renderResults();
  renderNearbyStrip();
  if(state.view==="pharmacies") renderPharmacyView();
  if(state.view==="saved") renderSaved();

  if(isUser){
    toast(`Showing pharmacies nearest to ${label} — checking for real nearby pharmacies…`, "📍");
    setLiveSearching(true);
    upgradeWithLivePharmacies(coords, label).finally(()=>setLiveSearching(false));
  }
}

function setLiveSearching(isSearching){
  const el = $("#liveSearchIndicator");
  if(!el) return;
  el.classList.toggle("show", isSearching);
}

function updateLocationButton(loading){
  const btn = $("#locationBtn");
  btn.classList.toggle("is-set", !!state.locationIsUser && !loading);
  let text = state.locationLabel || "Set your location";
  if(!loading && state.locationAccuracy && state.locationAccuracy > 500){
    text += ` (±${state.locationAccuracy >= 1000 ? (state.locationAccuracy/1000).toFixed(1)+" km" : Math.round(state.locationAccuracy)+" m"})`;
  }
  const labelEl = $("#locationLabel");
  labelEl.textContent = loading ? "Finding pharmacies near you…" : text;
  labelEl.title = (!loading && state.locationFullAddress) ? state.locationFullAddress : "";
}

/* Strip of the closest pharmacies, shown in the hero once a location is set. */
function renderNearbyStrip(){
  const el = $("#nearbyStrip");
  if(!el) return;
  const top = PHARMACIES.slice().sort((a,b)=>distanceKm(a)-distanceKm(b)).slice(0,4);
  if(!top.length){ el.innerHTML = ""; return; }
  el.innerHTML = top.map(p=>{
    const stocked = MEDICINES.filter(m=>STOCK[p.id][m.id]).length;
    return `
    <button class="nearby-pill" data-nearby="${p.id}">
      <b>${p.name}</b>
      <span>${distanceLabel(p)} · ${stocked} meds · ★ ${p.rating}</span>
    </button>`;
  }).join("");
  $$("[data-nearby]", el).forEach(btn=>btn.addEventListener("click", ()=>switchView("pharmacies")));
}

/* ---------------------------------------------------------------------------
   16. TICKER STATS
   ------------------------------------------------------------------------- */
function renderTicker(){
  $("#statMeds").textContent = MEDICINES.length;
  if(state.pharmaciesLoading || !PHARMACIES.length){
    $("#statPharm").textContent = "…";
    $("#statInStock").textContent = "…";
    $("#stat24").textContent = "…";
    return;
  }
  $("#statPharm").textContent = PHARMACIES.length;
  const total = MEDICINES.length*PHARMACIES.length;
  let inStock = 0;
  PHARMACIES.forEach(p=>MEDICINES.forEach(m=>{ if(STOCK[p.id][m.id]) inStock++; }));
  $("#statInStock").textContent = total ? Math.round((inStock/total)*100) + "%" : "0%";
  $("#stat24").textContent = PHARMACIES.filter(p=>p.open24 && distanceKm(p)<=10).length;
}
let syncSeconds = 0;
function tickSync(){
  syncSeconds += 4;
  $("#syncFoot").textContent = syncSeconds < 60 ? `Last synced ${syncSeconds}s ago` : `Last synced ${Math.floor(syncSeconds/60)}m ago`;
}

/* ---------------------------------------------------------------------------
   17. INIT & EVENT BINDING
   ------------------------------------------------------------------------- */
function init(){
  buildStock();
  state.userCoords = DELHI_CENTER;
  state.locationLabel = "Delhi (default)";

  renderCategoryChips();
  renderResults();
  renderTicker();
  renderNearbyStrip();
  updateCounts();
  updateLocationButton(false);
  renderFooterMeta();
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark);

  // navigation
  $$("[data-nav]").forEach(el=>el.addEventListener("click", (e)=>{
    e.preventDefault();
    switchView(el.dataset.nav);
  }));

  // footer: category quick-links jump into search view with that category active
  $$("[data-footer-cat]").forEach(el=>el.addEventListener("click", (e)=>{
    e.preventDefault();
    state.activeCategory = el.dataset.footerCat;
    switchView("search");
    renderCategoryChips();
    renderResults();
    window.scrollTo({top:0, behavior:"smooth"});
  }));
  const viewAllCats = $("#footerViewAllCats");
  if(viewAllCats) viewAllCats.addEventListener("click", (e)=>{
    e.preventDefault();
    state.activeCategory = null;
    switchView("search");
    renderCategoryChips();
    renderResults();
    window.scrollTo({top:0, behavior:"smooth"});
  });

  // footer: info drawer links (How this works / Privacy / Terms / Disclaimer / Accuracy)
  $$("[data-info]").forEach(el=>el.addEventListener("click", (e)=>{
    e.preventDefault();
    openInfoDrawer(el.dataset.info);
  }));

  // footer: newsletter / price-alert signup (demo — no real submission)
  const signupForm = $("#footerSignupForm");
  if(signupForm) signupForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    signupForm.reset();
    toast("You're on the list — well, hypothetically. This doesn't send real emails.", "✉");
  });

  // footer: back to top
  const toTop = $("#footerToTop");
  if(toTop) toTop.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));

  // theme toggle
  $("#themeToggle").addEventListener("click", ()=>{
    const isDark = document.documentElement.getAttribute("data-theme")==="dark";
    setTheme(!isDark);
  });

  // premium toggle
  $("#premiumToggle").addEventListener("click", ()=>{
    state.premium ? deactivatePremium() : activatePremium();
  });

  // search
  const input = $("#searchInput");
  input.addEventListener("input", ()=>{
    renderSuggestions(input.value.trim());
  });
  input.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"){
      state.query = input.value.trim();
      $("#suggestList").classList.remove("show");
      switchView("search");
      renderResults();
    }
  });
  $("#searchBtn").addEventListener("click", ()=>{
    state.query = input.value.trim();
    $("#suggestList").classList.remove("show");
    switchView("search");
    renderResults();
  });
  document.addEventListener("click", (e)=>{
    if(!e.target.closest(".search-counter")) $("#suggestList").classList.remove("show");
  });

  // location
  renderLocalityList();
  $("#locationBtn").addEventListener("click", (e)=>{ e.stopPropagation(); toggleLocationPanel(); });
  $("#detectBtn").addEventListener("click", requestGeolocation);
  document.addEventListener("click", (e)=>{
    if(!e.target.closest(".location-row")) toggleLocationPanel(false);
  });

  // filters
  $$("#radiusFilter .chip").forEach(chip=>chip.addEventListener("click", ()=>{
    state.maxRadius = Number(chip.dataset.radius);
    $$("#radiusFilter .chip").forEach(c=>c.classList.toggle("active", c===chip));
    if(state.maxRadius > 0 && !state.userCoords){
      toast("Set your location for accurate distance filtering.", "📍");
    }
    renderResults();
  }));
  $$("#rxFilter .chip").forEach(chip=>chip.addEventListener("click", ()=>{
    state.rxFilter = chip.dataset.rx;
    $$("#rxFilter .chip").forEach(c=>c.classList.toggle("active", c===chip));
    renderResults();
  }));
  $("#priceRange").addEventListener("input", (e)=>{
    state.maxPrice = Number(e.target.value);
    $("#priceVal").textContent = currency(state.maxPrice);
    renderResults();
  });
  $("#inStockOnly").addEventListener("click", (e)=>{
    state.inStockOnly = !state.inStockOnly;
    e.target.classList.toggle("active", state.inStockOnly);
    renderResults();
  });
  $("#open24Only").addEventListener("click", (e)=>{
    state.open24Only = !state.open24Only;
    e.target.classList.toggle("active", state.open24Only);
    renderResults();
  });
  $("#sortSelect").addEventListener("change", (e)=>{
    state.sort = e.target.value;
    renderResults();
  });
  $("#resetFilters").addEventListener("click", ()=>{
    state.rxFilter="all"; state.maxPrice=700; state.inStockOnly=false; state.open24Only=false; state.sort="relevance";
    state.query=""; state.activeCategory=null; state.maxRadius=0;
    input.value="";
    $("#priceRange").value=700; $("#priceVal").textContent=currency(700);
    $$("#rxFilter .chip").forEach(c=>c.classList.toggle("active", c.dataset.rx==="all"));
    $("#inStockOnly").classList.remove("active");
    $("#open24Only").classList.remove("active");
    $$("#radiusFilter .chip").forEach(c=>c.classList.toggle("active", c.dataset.radius==="0"));
    $("#sortSelect").value="relevance";
    renderCategoryChips();
    renderResults();
  });

  // compare tray
  $("#trayCompareBtn").addEventListener("click", ()=>switchView("compare"));
  $("#trayClearBtn").addEventListener("click", ()=>{
    state.compare.clear();
    updateCounts();
    renderTray();
    if(state.view==="compare") renderCompareView();
  });

  setInterval(tickSync, 4000);

  // The default Delhi-centre view is already fully usable (curated
  // network, instant). Quietly try to enrich it with real nearby
  // pharmacies via OpenStreetMap in the background — no effect on the UI
  // if it's slow or blocked.
  enrichWithLivePharmacies(DELHI_CENTER, "Delhi (default)");
}

document.addEventListener("DOMContentLoaded", init);