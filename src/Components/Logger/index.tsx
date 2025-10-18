// logger.ts – toaster simplu, pur DOM
type LogType = "info" | "success" | "error";
type LogOpts = { ttl?: number; type?: LogType };

const ROOT_ID = "log-toaster-root";
const MIN_TTL = 1200;

function ensureRoot(): HTMLElement {
    let el = document.getElementById(ROOT_ID) as HTMLElement | null;
    if (!el) {
        el = document.createElement("div");
        el.id = ROOT_ID;
        document.body.appendChild(el);
    }
    return el;
}

function addBaseStylesOnce() {
    if (document.getElementById("log-toaster-style")) return;
    const style = document.createElement("style");
    style.id = "log-toaster-style";
    style.textContent = `
#${ROOT_ID}{position:fixed;right:16px;bottom:16px;z-index:9999;pointer-events:none}
#${ROOT_ID} .log-stack{display:flex;flex-direction:column;gap:8px;align-items:flex-end}
#${ROOT_ID} .log-toast{
  pointer-events:auto;background:rgba(22,22,22,.92);color:#f5f5f5;
  border:1px solid rgba(255,255,255,.08);backdrop-filter:blur(6px);
  padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.2;
  box-shadow:0 4px 18px rgba(0,0,0,.28);
  transform:translateY(8px);opacity:0;will-change:transform,opacity;
  display:flex;align-items:center;max-width:min(360px,90vw)
}
#${ROOT_ID} .log-dot{display:inline-block;width:6px;height:6px;border-radius:999px;margin-right:8px;background:currentColor;opacity:.9;flex:0 0 6px}
#${ROOT_ID} .log-text{white-space:pre-wrap;word-break:break-word}
#${ROOT_ID} .info{color:#a3c9ff}
#${ROOT_ID} .success{color:#96e6a1}
#${ROOT_ID} .error{color:#ff9aa2}

@keyframes log-slide-up{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes log-fade-out{to{opacity:0;transform:translateY(-6px)}}
  `;
    document.head.appendChild(style);
}

function ensureStack(): HTMLElement {
    const root = ensureRoot();
    let stack = root.querySelector(".log-stack") as HTMLElement | null;
    if (!stack) {
        stack = document.createElement("div");
        stack.className = "log-stack";
        root.appendChild(stack);
    }
    return stack;
}

export function log(text: string, opts: LogOpts = {}) {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    addBaseStylesOnce();
    const stack = ensureStack();

    const ttl = Math.max(MIN_TTL, opts.ttl ?? 2500);
    const type = opts.type ?? "info";

    const toast = document.createElement("div");
    toast.className = `log-toast ${type}`;

    const dot = document.createElement("span");
    dot.className = "log-dot";

    const body = document.createElement("span");
    body.className = "log-text";
    body.textContent = text; // sigur, fără HTML injection

    toast.appendChild(dot);
    toast.appendChild(body);

    // adaugă la final (vizual, de jos în sus)
    stack.appendChild(toast);

    // intrare: mic slide-up + fade-in
    toast.style.animation = `log-slide-up 220ms ease-out forwards`;

    // programăm fade-out spre final
    const fadeDelay = Math.max(0, ttl - 350);
    const fadeTimer = window.setTimeout(() => {
        toast.style.animation = `log-fade-out 350ms ease-in forwards`;
    }, fadeDelay);

    // cleanup
    const removeTimer = window.setTimeout(() => {
        toast.remove();
    }, ttl + 40); // mic buffer

    // click = dismiss instant
    toast.addEventListener("click", () => {
        window.clearTimeout(fadeTimer);
        window.clearTimeout(removeTimer);
        toast.remove();
    });
}
