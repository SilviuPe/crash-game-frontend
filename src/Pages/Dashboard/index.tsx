import { useEffect, useRef, useState } from "react";
import "./index.css";

/** ===== Tuning (graph) ===== */
const WINDOW_S = 12;

/** ===== Types ===== */
interface RoundPoint {
    t: number;
    multiplier: number;
    status: "active" | "crashed";
}
type ToastKind = "info" | "success" | "warn" | "error";

/** ===== Page (UI-ONLY) ===== */
function Dashboard() {
    // --- UI state controlat local (TU poți înlocui/gestiona din logică proprie) ---
    const [points] = useState<RoundPoint[]>([]);         // TU vei popula
    const [roundActive] = useState(false);               // TU vei seta
    const [betAmount, setBetAmount] = useState<number>(100);
    // const [placedBet] = useState<number>(0);             // TU vei seta
    // const [liveBalance] = useState<number | null>(null); // TU vei seta
    // const [cashedOut] = useState(false);                 // TU vei seta
    const [currentMultiplier] = useState<number>(1.0);   // TU vei seta (exact de la server)
    const [toasts, setToasts] = useState<{ id: number; kind: ToastKind; text: string }[]>([]);

    const msgIdRef = useRef(1);
    const crashedRef = useRef<boolean>(false);           // TU îl poți actualiza din logică

    const pushToast = (text: string, kind: ToastKind = "info") => {
        const id = msgIdRef.current++;
        setToasts(list => [...list, { id, kind, text }]);
        setTimeout(() => setToasts(list => list.filter(x => x.id !== id)), 2500);
    };

    /** ===== Actions (UI placeholders) ===== */
    const handlePlaceBet = () => {
        // TODO: înlocuiește cu logica ta (WS place_bet etc.)
        pushToast("Placed bet");
    };

    const handleCashout = () => {
        // TODO: înlocuiește cu logica ta (WS cashout etc.)
        pushToast("Cashed out");
    };

    const handleLogout = () => {
        // TODO: înlocuiește cu logica ta (logout real)
        pushToast("UI only: Logout", "info");
    };

    return (
        <div className="aviator">
            {/* Header */}
            <header className="appbar">
                <button className="icon-btn" aria-label="Back">✕</button>
                <div className="appbar-title">Crash Game</div>
                <div className="appbar-balance">
                    <span className="amount">1234</span>
                    <span className="currency">TZS</span>
                </div>
                <button className="icon-btn" aria-label="Menu">≡</button>
            </header>

            {/* Recent Multipliers (mock vizual) */}
            <div className="recent-row">
                {[2.48, 1.39, 1.54, 3.45, 5.57, 2.60, 6.44, 2.08].map((m, i) => (
                    <span key={i} className="chip">{m.toFixed(2)}x</span>
                ))}
            </div>

            {/* Game Area */}
            <section className="game-card">
                <div className={`status ${roundActive ? "active" : crashedRef.current ? "crashed" : "idle"}`}>
                    {roundActive ? "FLYING" : crashedRef.current ? "CRASHED" : "PLACE BET"}
                </div>

                <div className="graph-wrap">
                    <div className="burst-bg" />
                    <div className={`big-mult ${crashedRef.current ? "crashed" : ""}`}>
                        {currentMultiplier.toFixed(2)}x
                    </div>
                    <div className="graph-overlay">
                        <Graph data={points} />
                    </div>
                </div>
            </section>

            {/* Bet Info */}
            <div className="live-bet-row">
                <div className="pill">Bet: <strong>{(0).toFixed(2)} TZS</strong></div>
                <div className={`pill ${false ? "ok" : ""}`}>
                    Cashout: <strong>{"-"} TZS</strong>
                </div>
            </div>

            {/* Bet Controls */}
            <section className="bet-panel">
                <div className="bet-card">
                    <div className="bet-header">Place Your Bet</div>

                    <div className="bet-row">
                        <button
                            className="step"
                            onClick={() => setBetAmount(a => Math.max(100, a - 100))}
                        >−</button>
                        <div className="amount">{betAmount.toFixed(2)} TZS</div>
                        <button
                            className="step"
                            onClick={() => setBetAmount(a => a + 100)}
                        >＋</button>
                    </div>

                    <div className="quick">
                        {[500, 1000, 2000, 5000].map(v => (
                            <button
                                className="quick-btn"
                                key={v}
                                onClick={() => setBetAmount(v)}
                            >
                                {v.toLocaleString()}
                            </button>
                        ))}
                    </div>

                    <div className="actions-row">
                        <button
                            className="btn-primary"
                            onClick={handlePlaceBet}
                        >
                            Place Bet
                        </button>

                        <button
                            className="btn-cashout"
                            onClick={handleCashout}
                        >
                            Cashout
                        </button>
                    </div>
                </div>
            </section>

            {/* History (vizual) */}
            <section className="history">
                <div className="history-tabs">
                    <button className="htab active">All Bets</button>
                    <button className="htab">My Bets</button>
                </div>
            </section>

            <footer className="bottom-safe" />
            <button className="btn-logout" onClick={handleLogout}>Logout</button>

            {/* Toasts */}
            <div className="toast-stack">
                {toasts.slice(-3).map(t => (
                    <div key={t.id} className={`toast float ${t.kind}`}>
                        {t.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

/** ===== Graph Component (UI-ONLY) ===== */
function Graph({ data }: { data: RoundPoint[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const CSS_W = 520, CSS_H = 260;
        canvas.width = CSS_W * dpr;
        canvas.height = CSS_H * dpr;
        canvas.style.width = CSS_W + "px";
        canvas.style.height = CSS_H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, CSS_W, CSS_H);
        if (data.length === 0) {
            // desen minim când nu avem date
            ctx.fillStyle = "#888";
            ctx.font = "12px Inter, system-ui, sans-serif";
            ctx.fillText("No data", 12, 18);
            return;
        }

        const padding = 16;
        const w = CSS_W - padding * 2;
        const h = CSS_H - padding * 2;

        // X scale (ultimele 12s)
        const windowMs = WINDOW_S * 1000;
        const lastT = data[data.length - 1].t;
        const xMin = lastT < windowMs ? 0 : lastT - windowMs;
        const xMax = xMin + windowMs;
        const xScale = (t: number) =>
            padding + ((Math.min(Math.max(t, xMin), xMax) - xMin) / (xMax - xMin)) * w;

        // Y scale log pentru aspect “natural”
        const maxMult = Math.max(2, ...data.map(p => p.multiplier));
        const yScale = (m: number) => {
            const logMax = Math.log(maxMult);
            const logM = Math.log(Math.max(1.0001, m));
            return CSS_H - padding - (logM / logMax) * h;
        };

        // grid
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, CSS_H - padding);
        ctx.lineTo(CSS_W - padding, CSS_H - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, CSS_H - padding);
        ctx.stroke();

        // Y labels
        ctx.fillStyle = "#888";
        ctx.font = "12px Inter, system-ui, sans-serif";
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const m = 1 + (i * (maxMult - 1)) / ySteps;
            const y = yScale(m);
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(CSS_W - padding, y);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillText(`${m.toFixed(1)}x`, 4, y - 2);
        }

        // X labels
        for (let i = 0; i <= WINDOW_S; i++) {
            const t = xMin + (i * windowMs) / WINDOW_S;
            const x = xScale(t);
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, CSS_H - padding);
            ctx.stroke();
            ctx.globalAlpha = 1;
            const sec = Math.round((t - xMin) / 1000);
            ctx.fillText(`${sec}s`, x - 8, CSS_H - 2);
        }

        // line (curbă Bezier simplă)
        ctx.beginPath();
        ctx.strokeStyle = "#a88df0";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        if (data.length > 1) {
            ctx.moveTo(xScale(data[0].t), yScale(data[0].multiplier));
            for (let i = 1; i < data.length; i++) {
                const prev = data[i - 1];
                const p = data[i];
                const x1 = xScale(prev.t), y1 = yScale(prev.multiplier);
                const x2 = xScale(p.t), y2 = yScale(p.multiplier);
                const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
                ctx.quadraticCurveTo(cx, cy, x2, y2);
            }
        }
        ctx.stroke();

        // crash marker
        const last = data[data.length - 1];
        if (last.status === "crashed") {
            const x = xScale(last.t);
            const y = yScale(last.multiplier);
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#e74c3c";
            ctx.font = "bold 14px Inter, system-ui, sans-serif";
            ctx.fillText(`CRASH: ${last.multiplier.toFixed(2)}x`, x + 8, y - 8);
        }
    }, [data]);

    return <canvas className="graph" ref={canvasRef} />;
}

export { Dashboard };
