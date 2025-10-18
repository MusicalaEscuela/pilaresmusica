/* ====== Navegación suave a secciones ====== */
document.querySelectorAll('.btn.pill').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const target = document.querySelector(btn.dataset.target);
    if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
  });
});

/* ====== Footer año ====== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ====== Audio: WebAudio para ejemplos ====== */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx;
let activeNodes = [];

function ensureCtx(){
  if(!ctx) ctx = new AudioCtx();
  return ctx;
}
function stopAll(){
  activeNodes.forEach(n=>{
    try{ n.stop(); }catch(_){}
    if(n.disconnect) try{ n.disconnect(); }catch(_){}
  });
  activeNodes = [];
}

/* Util: crea oscilador con envolvente corta */
function playTone({freq=440, time=0, dur=0.2, type='sine', gain=0.12}){
  const c = ensureCtx();
  const now = c.currentTime + time;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + dur + 0.05);
  activeNodes.push(osc, g);
}

/* Click: Detener en todos los bloques */
['stopAll','stopAll2','stopAll3'].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', stopAll);
});

/* ====== Ritmo: pulso + acento (100 BPM, acento cada 4) ====== */
document.getElementById('playBeat')?.addEventListener('click', ()=>{
  stopAll();
  const bpm = 100;
  const beatDur = 60 / bpm;
  const bars = 2;
  for(let i=0;i<bars*4;i++){
    const isAccent = i % 4 === 0;
    const f = isAccent ? 1000 : 750;
    playTone({freq:f, time:i*beatDur, dur:0.07, type:'triangle', gain:isAccent?0.16:0.10});
  }
});

/* ====== Melodía: do–re–mi–re–do (C mayor aprox.) ====== */
document.getElementById('playMelody')?.addEventListener('click', ()=>{
  stopAll();
  const notes = [261.63, 293.66, 329.63, 293.66, 261.63]; // C D E D C
  const step = 0.35;
  notes.forEach((f,i)=> playTone({freq:f, time:i*step, dur:0.28, type:'sine', gain:0.14}));
});

/* ====== Armonía: I–V–vi–IV (C–G–Am–F) ====== */
function playChord(freqs, t0, hold=0.9){
  const c = ensureCtx();
  const now = c.currentTime + t0;
  freqs.forEach((f,idx)=>{
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now);
    const vol = 0.09 * (idx===0?1.1:1); // bajita y un pelín más fuerte la fundamental
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + hold);
    osc.connect(g).connect(c.destination);
    osc.start(now);
    osc.stop(now + hold + 0.05);
    activeNodes.push(osc, g);
  });
}
document.getElementById('playChords')?.addEventListener('click', ()=>{
  stopAll();
  const STEP = 1.0;
  // Aprox en Hz (C4 E4 G4), (G3 B3 D4), (A3 C4 E4), (F3 A3 C4)
  playChord([261.63,329.63,392.00], 0*STEP); // C
  playChord([196.00,246.94,293.66], 1*STEP); // G
  playChord([220.00,261.63,329.63], 2*STEP); // Am
  playChord([174.61,220.00,261.63], 3*STEP); // F
});
