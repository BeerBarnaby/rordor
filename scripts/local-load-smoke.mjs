// Bounded, read-only local smoke test. NOT a production capacity certification.
const base = new URL(process.argv[2] ?? 'http://localhost:3000/');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Only localhost targets are allowed. Use a separately approved staging workload for capacity testing.');
const concurrency = Math.min(20, Math.max(1, Number(process.argv[3]) || 5));
const total = 50;
let cursor = 0;
const samples = [];
let failed = 0;
await Promise.all(Array.from({length:concurrency}, async()=>{
  while (cursor++ < total) {
    const started = performance.now();
    try {
      const response = await fetch(base, {signal:AbortSignal.timeout(15000)});
      await response.arrayBuffer();
      if (!response.ok) failed++;
    } catch { failed++; }
    samples.push(performance.now()-started);
  }
}));
samples.sort((a,b)=>a-b);
console.log(JSON.stringify({target:base.origin,requests:samples.length,concurrency,failures:failed,p50Ms:Math.round(samples[Math.floor(samples.length*.5)]),p95Ms:Math.round(samples[Math.floor(samples.length*.95)]),scope:'Local document GET only; excludes Supabase, auth, score writes, real devices and production capacity.'},null,2));
process.exitCode = failed ? 1 : 0;
