/*! LBRCE Assistant widget — embed with:
 * <script src="https://YOUR-APP-DOMAIN/lbrce-assistant.js" defer></script>
 * Optional: data-api="https://YOUR-APP-DOMAIN/api/public/chat"
 */
(function () {
  if (window.__lbrceAssistant) return;
  window.__lbrceAssistant = true;

  var script = document.currentScript;
  var origin = script && script.src ? new URL(script.src).origin : location.origin;
  var API = (script && script.getAttribute("data-api")) || origin + "/api/public/chat";
  var TTS_API = (script && script.getAttribute("data-tts")) || origin + "/api/public/tts";

  var css = `
  .lbx,.lbx *{box-sizing:border-box;font-family:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .lbx-fab{position:fixed;right:22px;bottom:22px;width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;z-index:2147483000;
    background:linear-gradient(145deg,#0f172a,#334155);color:#fff;box-shadow:0 12px 30px rgba(15,23,42,.35);display:grid;place-items:center;transition:transform .25s}
  .lbx-fab:hover{transform:translateY(-2px) scale(1.04)}
  .lbx-fab svg{width:26px;height:26px}
  .lbx-fab .lbx-ping{position:absolute;top:6px;right:6px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #0f172a}
  .lbx-panel{position:fixed;right:22px;bottom:94px;width:380px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 120px);z-index:2147483000;
    display:flex;flex-direction:column;border-radius:22px;overflow:hidden;background:rgba(255,255,255,.82);backdrop-filter:blur(18px) saturate(160%);
    -webkit-backdrop-filter:blur(18px) saturate(160%);border:1px solid rgba(148,163,184,.35);box-shadow:0 30px 60px -12px rgba(15,23,42,.35);
    opacity:0;transform:translateY(24px) scale(.98);pointer-events:none;transition:opacity .3s ease,transform .35s cubic-bezier(.2,.9,.3,1.2)}
  .lbx-panel.open{opacity:1;transform:none;pointer-events:auto}
  .lbx-head{display:flex;align-items:center;gap:12px;padding:16px 16px;background:linear-gradient(135deg,#0f172a,#334155);color:#f8fafc}
  .lbx-av{position:relative;width:44px;height:44px;border-radius:50%;background:linear-gradient(145deg,#e2e8f0,#94a3b8);display:grid;place-items:center;color:#0f172a;font-weight:700;font-size:17px}
  .lbx-av i{position:absolute;right:0;bottom:1px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #1e293b;animation:lbxp 2s infinite}
  @keyframes lbxp{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}70%{box-shadow:0 0 0 7px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
  .lbx-title{flex:1;line-height:1.2}.lbx-title b{display:block;font-size:15px}.lbx-title span{font-size:12px;color:#cbd5e1}
  .lbx-ib{background:rgba(255,255,255,.1);border:0;color:#f8fafc;width:34px;height:34px;border-radius:10px;cursor:pointer;display:grid;place-items:center}
  .lbx-end{width:auto;padding:0 11px;font-size:12px;font-weight:600;gap:5px;display:inline-flex;align-items:center;white-space:nowrap}
  .lbx-ended{align-self:center;text-align:center;margin:auto 0;padding:20px 16px;color:#334155;font-size:14px}
  .lbx-ended b{display:block;font-size:16px;color:#0f172a;margin-bottom:4px}
  .lbx-new{margin-top:14px;border:0;cursor:pointer;background:#0f172a;color:#fff;padding:10px 18px;border-radius:12px;font-size:13px;font-weight:600}
  .lbx-ib:hover{background:rgba(255,255,255,.2)}.lbx-ib svg{width:17px;height:17px}.lbx-ib.off{opacity:.5}
  .lbx-body{flex:1;overflow-y:auto;padding:18px 14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .lbx-m{max-width:84%;padding:10px 13px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;animation:lbxin .25s ease}
  @keyframes lbxin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .lbx-m.bot{align-self:flex-start;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-bottom-left-radius:5px}
  .lbx-m.user{align-self:flex-end;background:#0f172a;color:#f8fafc;border-bottom-right-radius:5px}
  .lbx-m a{color:#2563eb}
  .lbx-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}
  .lbx-chip{border:1px solid #cbd5e1;background:rgba(255,255,255,.7);color:#334155;font-size:12px;padding:6px 10px;border-radius:999px;cursor:pointer}
  .lbx-chip:hover{background:#0f172a;color:#fff;border-color:#0f172a}
  .lbx-typing{display:inline-flex;gap:4px}.lbx-typing i{width:7px;height:7px;border-radius:50%;background:#94a3b8;animation:lbxb 1.2s infinite}
  .lbx-typing i:nth-child(2){animation-delay:.15s}.lbx-typing i:nth-child(3){animation-delay:.3s}
  @keyframes lbxb{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .lbx-foot{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(148,163,184,.3);background:rgba(255,255,255,.6)}
  .lbx-in{flex:1;border:1px solid #cbd5e1;border-radius:14px;padding:10px 12px;font-size:14px;outline:none;background:#fff;color:#0f172a}
  .lbx-in:focus{border-color:#334155;box-shadow:0 0 0 3px rgba(51,65,85,.12)}
  .lbx-btn{width:42px;height:42px;border-radius:12px;border:0;cursor:pointer;display:grid;place-items:center;background:#e2e8f0;color:#334155}
  .lbx-btn svg{width:19px;height:19px}.lbx-btn.send{background:#0f172a;color:#fff}.lbx-btn:disabled{opacity:.5;cursor:default}
  .lbx-btn.rec{background:#334155;color:#fff;animation:lbxp 1.4s infinite}
  .lbx-note{font-size:10.5px;text-align:center;color:#64748b;padding:0 0 8px;background:rgba(255,255,255,.6)}
  @media (max-width:480px){.lbx-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}.lbx-fab.hide{display:none}}
  `;
  var I = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 19v3"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  };

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "lbx";
  root.innerHTML =
    '<button class="lbx-fab" aria-label="Chat with Anya, LBRCE Guide">' + I.chat + '<span class="lbx-ping"></span></button>' +
    '<section class="lbx-panel" role="dialog" aria-label="LBRCE Assistant">' +
    '<header class="lbx-head"><div class="lbx-av">A<i></i></div><div class="lbx-title"><b>Anya, LBRCE Guide</b><span>Online · Usually replies instantly</span></div>' +
    '<button class="lbx-ib lbx-end" title="End this chat">End chat</button><button class="lbx-ib lbx-tts" title="Read answers aloud">' + I.vol + '</button><button class="lbx-ib lbx-close" title="Close">' + I.x + "</button></header>" +
    '<div class="lbx-body" aria-live="polite"></div>' +
    '<div class="lbx-chips"></div>' +
    '<form class="lbx-foot"><button type="button" class="lbx-btn lbx-mic" title="Speak">' + I.mic + '</button>' +
    '<input class="lbx-in" placeholder="Ask about admissions, courses…" maxlength="1000" />' +
    '<button type="submit" class="lbx-btn send" title="Send">' + I.send + "</button></form>" +
    '<div class="lbx-note">AI assistant · verify key details at lbrce.ac.in</div></section>';
  document.body.appendChild(root);

  var $ = function (s) { return root.querySelector(s); };
  var fab = $(".lbx-fab"), panel = $(".lbx-panel"), body = $(".lbx-body"), form = $(".lbx-foot"),
    input = $(".lbx-in"), sendBtn = $(".send"), micBtn = $(".lbx-mic"), ttsBtn = $(".lbx-tts"), chips = $(".lbx-chips");
  var history = [], busy = false, ttsOn = true, ended = false;
  var endBtn = $(".lbx-end");

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function md(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|\n)\s*[-*] /g, "$1• ")
      .replace(/(https?:\/\/[^\s)<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
  function add(role, text) {
    var d = document.createElement("div");
    d.className = "lbx-m " + role;
    d.innerHTML = role === "bot" ? md(text) : esc(text);
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }
  function decodePCMChunk(pending, b64) {
    var bin = atob(b64), inc = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) inc[i] = bin.charCodeAt(i);
    var bytes = new Uint8Array(pending.length + inc.length);
    bytes.set(pending); bytes.set(inc, pending.length);
    var usable = bytes.length - (bytes.length % 2);
    var view = new DataView(bytes.buffer);
    var samples = new Float32Array(usable / 2);
    for (var j = 0; j < samples.length; j++) samples[j] = view.getInt16(j * 2, true) / 32768;
    return { samples: samples, pending: bytes.slice(usable) };
  }
  var playCtl = null;
  function stopSpeaking() {
    if (playCtl) {
      playCtl.controller.abort();
      playCtl.sources.forEach(function (s) { try { s.stop(); } catch (e) {} });
      try { playCtl.ctx.close(); } catch (e) {}
      playCtl = null;
    }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  function fallbackSpeak(t) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t);
    u.lang = "en-IN"; u.rate = 1.02;
    var v = speechSynthesis.getVoices().filter(function (x) { return /en-IN/i.test(x.lang); })[0];
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  async function speak(text) {
    if (!ttsOn) return;
    var t = text.replace(/[*#_`>]/g, " ").replace(/https?:\/\/\S+/g, " the website ").replace(/\s+/g, " ").trim();
    if (!t) return;
    stopSpeaking();
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return fallbackSpeak(t);
    var ctl = new AbortController(), ctx = new AC({ sampleRate: 24000 }), sources = [];
    playCtl = { controller: ctl, ctx: ctx, sources: sources };
    try {
      if (ctx.state === "suspended") await ctx.resume();
      var res = await fetch(TTS_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: t }), signal: ctl.signal });
      if (!res.ok || !res.body) throw new Error("tts " + res.status);
      var reader = res.body.getReader(), dec = new TextDecoder();
      var buf = "", pending = new Uint8Array(0), playhead = ctx.currentTime + 0.05;
      while (true) {
        var r = await reader.read();
        if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        var lines = buf.split("\n");
        buf = lines.pop() || "";
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith("data:")) continue;
          var data = line.slice(5).trim();
          if (!data) continue;
          var ev;
          try { ev = JSON.parse(data); } catch (e) { continue; }
          if (ev.type === "error") throw new Error("speech failed");
          if (ev.type !== "speech.audio.delta" || !ev.audio) continue;
          var part = decodePCMChunk(pending, ev.audio);
          pending = part.pending;
          if (!part.samples.length) continue;
          var b = ctx.createBuffer(1, part.samples.length, 24000);
          b.copyToChannel(part.samples, 0);
          var src = ctx.createBufferSource();
          src.buffer = b; src.connect(ctx.destination);
          sources.push(src);
          src.onended = function () { var k = sources.indexOf(this); if (k > -1) sources.splice(k, 1); };
          playhead = Math.max(playhead, ctx.currentTime + 0.05);
          src.start(playhead);
          playhead += b.duration;
        }
      }
      if (playCtl && playCtl.controller === ctl) playCtl = null;
    } catch (e) {
      if (playCtl && playCtl.controller === ctl) playCtl = null;
      try { ctx.close(); } catch (e2) {}
      if (!ctl.signal.aborted) fallbackSpeak(t);
    }
  }

  ["Admission codes?", "Departments", "How to reach?", "Placements"].forEach(function (q) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "lbx-chip"; b.textContent = q;
    b.onclick = function () { send(q); };
    chips.appendChild(b);
  });

  function toggle(open) {
    var o = open === undefined ? !panel.classList.contains("open") : open;
    panel.classList.toggle("open", o);
    fab.classList.toggle("hide", o);
    fab.innerHTML = (o ? I.x : I.chat) + (o ? "" : '<span class="lbx-ping"></span>');
    if (o) {
      if (!body.children.length && !ended) add("bot", "Hi! I'm Anya 👋 your LBRCE guide. Ask me about admissions, departments, transport or placements.");
      setTimeout(function () { input.focus(); }, 300);
    } else stopSpeaking();
  }
  fab.onclick = function () { toggle(); };
  $(".lbx-close").onclick = function () { toggle(false); };
  ttsBtn.onclick = function () {
    ttsOn = !ttsOn; ttsBtn.classList.toggle("off", !ttsOn);
    if (!ttsOn) stopSpeaking();
  };

  function endChat() {
    stopSpeaking();
    if (typeof rec !== "undefined" && rec) { try { rec.stop(); } catch (e) {} }
    ended = true; history = []; body.innerHTML = ""; chips.style.display = "none";
    input.disabled = true; sendBtn.disabled = true; micBtn.disabled = true; endBtn.style.display = "none";
    var d = document.createElement("div");
    d.className = "lbx-ended";
    d.innerHTML = "<b>Chat ended 👋</b>Thanks for chatting with LBRCE! Come back anytime.<br>";
    var nb = document.createElement("button");
    nb.type = "button"; nb.className = "lbx-new"; nb.textContent = "Start new chat";
    nb.onclick = newChat;
    d.appendChild(nb);
    body.appendChild(d);
  }
  function newChat() {
    ended = false; history = []; body.innerHTML = ""; chips.style.display = "";
    input.disabled = false; sendBtn.disabled = false; micBtn.disabled = false; endBtn.style.display = "";
    add("bot", "Hi! I'm Anya 👋 your LBRCE guide. Ask me about admissions, departments, transport or placements.");
    input.focus();
  }
  endBtn.onclick = endChat;

  async function send(text) {
    text = (text || "").trim();
    if (!text || busy || ended) return;
    busy = true; sendBtn.disabled = true; chips.style.display = "none";
    input.value = "";
    add("user", text);
    history.push({ role: "user", content: text });
    var bubble = add("bot", "");
    bubble.innerHTML = '<span class="lbx-typing"><i></i><i></i><i></i></span>';
    var full = "";
    try {
      var res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }) });
      if (!res.ok || !res.body) throw new Error((await res.text()) || "Request failed");
      var reader = res.body.getReader(), dec = new TextDecoder();
      while (true) {
        var r = await reader.read();
        if (r.done) break;
        full += dec.decode(r.value, { stream: true });
        bubble.innerHTML = md(full);
        body.scrollTop = body.scrollHeight;
      }
      if (!full) throw new Error("Sorry, I couldn't answer that. Please try again.");
      history.push({ role: "assistant", content: full });
      speak(full);
    } catch (e) {
      history.pop();
      bubble.textContent = (e && e.message) || "Connection problem. Please try again.";
    } finally {
      busy = false; sendBtn.disabled = ended;
    }
  }
  form.onsubmit = function (e) { e.preventDefault(); send(input.value); };

  var rec = null;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) micBtn.style.display = "none";
  else {
    rec = new SR(); var listening = false;
    rec.lang = "en-IN"; rec.interimResults = true;
    rec.onresult = function (e) {
      var t = ""; for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      input.value = t;
      if (e.results[e.results.length - 1].isFinal) send(t);
    };
    rec.onend = function () { listening = false; micBtn.classList.remove("rec"); };
    rec.onerror = rec.onend;
    micBtn.onclick = function () {
      if (listening) return rec.stop();
      stopSpeaking();
      listening = true; micBtn.classList.add("rec"); rec.start();
    };
  }
})();
