import { drawPortrait } from "../render/sprites.js";
import { play } from "../audio.js";

const NAMES = { baron: "BARON TARMAC", veggie: "VEGGIE BOY", narrator: "" };

/**
 * Typewriter dialogue box with portrait and choice buttons. Click the box to skip typing.
 * Speakers: "veggie", "baron", or "narrator" (no portrait).
 */
export function createDialogue({ box, portrait, who, line, choices }, reduced) {
  let timer = null;
  return {
    say(speaker, text, buttons = []) {
      const narr = speaker === "narrator";
      portrait.hidden = narr;
      box.classList.toggle("narr", narr);
      if (!narr) drawPortrait(portrait, speaker);
      who.textContent = NAMES[speaker] ?? "";
      who.className = "who" + (speaker === "baron" ? " baron" : "");
      who.hidden = narr;
      choices.innerHTML = "";
      clearInterval(timer);
      let n = 0;
      const done = () => {
        clearInterval(timer);
        line.textContent = text;
        if (choices.childElementCount) return;
        buttons.forEach((b, ix) => {
          const el = document.createElement("button");
          el.textContent = b.label;
          if (b.cls) el.className = b.cls;
          el.disabled = !!b.disabled;
          el.onclick = (ev) => {
            ev.stopPropagation();
            b.fn();
          };
          choices.appendChild(el);
          if (ix === 0 && !b.disabled) {
            try { el.focus({ preventScroll: true }); } catch (_) { /* ignore */ }
          }
        });
      };
      if (reduced) done();
      else {
        line.textContent = "";
        timer = setInterval(() => {
          n += 2;
          if (n % 6 === 0) play(speaker === "baron" ? "baronBlip" : "blip");
          line.textContent = text.slice(0, n);
          if (n >= text.length) done();
        }, 18);
      }
      box.onclick = (e) => {
        if (e.target.closest("button")) return;
        if (line.textContent.length < text.length) done();
      };
    },
  };
}
