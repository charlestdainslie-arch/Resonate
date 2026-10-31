/* RESONATE · Chas's own recorded voice for Max Chasroom (Issue #49, Chas 31 Oct: "use these ones for now").
   Private by design: no voice file is deployed. Chas loads his voice folder (max-voice-chas: manifest.json + one
   .m4a per line) from his own computer with "Load my voice"; it is kept only in this browser (IndexedDB) and
   never uploaded. Max then speaks each line from Chas's recording where one exists, and with the device's
   on-device voice for the lines not yet recorded (the per-position "lens" lines). The note under Max's controls
   says which is which. "Forget my voice" removes it from this browser.
   Plugs into presenter.js through window.MaxVoice.register (no change to presenter.js). */
(function () {
  'use strict';
  if (!window.MaxVoice) return;
  const DB = 'resonate-chas-voice', STORE = 'pack';
  let pack = null;            // { label, clips: { clipId: objectURL }, count }
  let audio = typeof Audio === 'function' ? new Audio() : null;
  let token = 0, timer = null;

  // ---- storage (this browser only) ----
  function idb() {
    return new Promise((res, rej) => {
      try {
        const r = indexedDB.open(DB, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(STORE);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
  }
  async function save(record) { try { const db = await idb(); await new Promise((res, rej) => { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(record, 'chas'); t.oncomplete = res; t.onerror = () => rej(t.error); }); } catch (e) { /* storage blocked: works for this visit only */ } }
  async function load() { try { const db = await idb(); return await new Promise((res, rej) => { const r = db.transaction(STORE).objectStore(STORE).get('chas'); r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error); }); } catch (e) { return null; } }
  async function forget() { try { const db = await idb(); await new Promise(res => { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).delete('chas'); t.oncomplete = res; t.onerror = res; }); } catch (e) {} }

  function use(record) {
    if (pack) Object.values(pack.clips).forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} });
    if (!record) { pack = null; status(); return; }
    const clips = {};
    Object.entries(record.files).forEach(([id, blob]) => { clips[id] = URL.createObjectURL(blob); });
    pack = { label: record.label || "Chas's own recorded voice", clips, count: Object.keys(clips).length };
    status();
  }

  // Reads a picked folder (or picked files): manifest.json maps clip ids to file names.
  async function fromFiles(fileList) {
    const files = Array.from(fileList || []);
    const byName = new Map(files.map(f => [f.name, f]));
    const manifestFile = byName.get('manifest.json');
    if (!manifestFile) throw new Error('No manifest.json in the folder you picked. Pick the max-voice-chas folder.');
    const manifest = JSON.parse(await manifestFile.text());
    const out = {};
    Object.entries(manifest.clips || {}).forEach(([id, name]) => { const f = byName.get(name); if (f) out[id] = f; });
    if (!Object.keys(out).length) throw new Error('The folder has a manifest but none of its sound files.');
    return { label: manifest.label, files: out, loadedAt: new Date().toISOString() };
  }

  // ---- the voice provider ----
  const bcp47 = lang => String(lang || '').split('_#')[0].replace(/_/g, '-');
  function deviceVoice() {
    const voices = (window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices() || []).filter(v => v.localService && /^en\b/i.test(bcp47(v.lang)));
    return voices.find(v => /^en-GB$/i.test(bcp47(v.lang))) || voices.find(v => /^en-AU$/i.test(bcp47(v.lang))) || voices[0] || null;
  }
  const spoken = t => t.replace(/ · /g, ', ').replace(/ — /g, ', ');
  let lastScript = null;
  const provider = {
    id: 'chas-recorded',
    async prepare(script) {
      lastScript = script;
      if (!pack) return false;
      return script.some(part => part.clips.some(c => pack.clips[c.id]));
    },
    note() {
      const all = (lastScript || []).flatMap(p => p.clips);
      const mine = all.filter(c => pack && pack.clips[c.id]).length;
      const rest = all.length - mine;
      return rest
        ? `Chas's own recorded voice for ${mine} of ${all.length} lines in this reading; the other ${rest} use your device's synthetic voice. Nothing is sent anywhere.`
        : `Chas's own recorded voice for every line in this reading. Nothing is sent anywhere.`;
    },
    speak(part, from, on) {
      const mine = ++token;
      let n = from;
      const next = () => {
        if (mine !== token) return;
        if (n >= part.clips.length) { on.done(); return; }
        const clip = part.clips[n];
        on.clip(n);
        const url = pack && pack.clips[clip.id];
        if (url && audio) {
          audio.src = url;
          audio.onended = () => { n++; next(); };
          audio.onerror = () => { n++; next(); };
          audio.play().catch(() => { if (mine === token) { n++; next(); } });
          return;
        }
        // Not recorded yet: the device's own voice for this line, or a short silent beat if there is none.
        const v = deviceVoice();
        if (!v || !window.SpeechSynthesisUtterance) { timer = setTimeout(() => { n++; next(); }, Math.max(1200, clip.text.split(' ').length * 380)); return; }
        const u = new SpeechSynthesisUtterance(spoken(clip.text));
        u.voice = v; u.lang = bcp47(v.lang); u.rate = 1; u.pitch = 0.85;
        let settled = false;
        const go = () => { if (settled || mine !== token) return; settled = true; clearTimeout(timer); n++; next(); };
        u.onend = go; u.onerror = go;
        try { window.speechSynthesis.speak(u); } catch (e) { go(); return; }
        // Android sometimes drops the end event: move on once speech has stopped.
        const guard = () => { if (settled || mine !== token) return; if (!window.speechSynthesis.speaking) go(); else timer = setTimeout(guard, 1200); };
        timer = setTimeout(guard, Math.max(2500, clip.text.split(' ').length * 420));
      };
      next();
    },
    stop() {
      token++; clearTimeout(timer);
      if (audio) { audio.onended = audio.onerror = null; try { audio.pause(); } catch (e) {} }
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    }
  };
  window.MaxVoice.register(provider);

  // ---- the panel ----
  function panel() {
    let box = document.getElementById('chasVoice');
    if (box) return box;
    const ribbon = document.querySelector('.mc-ribbon');
    const html = `<section class="chas-voice" id="chasVoice" aria-label="Chas's recorded voice">
      <p id="chasVoiceStatus"></p>
      <label class="ghost-button chas-voice-load">Load my voice<input type="file" id="chasVoicePick" webkitdirectory directory multiple hidden></label>
      <button type="button" class="ghost-button" id="chasVoiceForget" hidden>Forget my voice</button>
    </section>`;
    if (ribbon) ribbon.insertAdjacentHTML('afterend', html); else document.body.insertAdjacentHTML('afterbegin', html);
    box = document.getElementById('chasVoice');
    document.getElementById('chasVoicePick').addEventListener('change', async e => {
      const s = document.getElementById('chasVoiceStatus');
      try { const record = await fromFiles(e.target.files); use(record); await save(record); }
      catch (err) { s.textContent = err.message; }
      e.target.value = '';
    });
    document.getElementById('chasVoiceForget').addEventListener('click', async () => { await forget(); use(null); });
    return box;
  }
  function status() {
    panel();
    const s = document.getElementById('chasVoiceStatus');
    s.textContent = pack
      ? `${pack.label}: ${pack.count} lines loaded on this device only. Max uses them wherever they fit.`
      : "Max can speak in Chas's own recorded voice. Load the max-voice-chas folder from this computer; it stays here and is never uploaded.";
    document.getElementById('chasVoiceForget').hidden = !pack;
  }

  const start = async () => { panel(); use(await load()); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.__chasVoice = { get loaded() { return pack ? pack.count : 0; }, fromFiles, use };
})();
