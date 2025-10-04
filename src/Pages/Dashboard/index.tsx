import { useEffect, useState, useRef } from "react";
import { validateToken } from "../../Utils/verifications";
import "./index.css";
import { endpoints } from "../../API/data";

// ===== Tuning =====
const WINDOW_S = 12;   // seconds visible on X axis
const X_SPEED  = 0.7;  // <1.0 = slower horizontal motion
const TAU_MS   = 120;  // smoothing time-constant (bigger = smoother)

// ===== Types =====
interface RoundPoint {
    t: number; // ms since round start (scaled by X_SPEED)
    multiplier: number;
    status: "active" | "crashed";
}

function Dashboard() {
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const [points, setPoints] = useState<RoundPoint[]>([]);
    const [roundActive, setRoundActive] = useState(false);
    const [betAmount, setBetAmount] = useState<number>(5);

    const wsRef = useRef<WebSocket | null>(null);
    const roundStartRef = useRef<number | null>(null);
    const crashedRef = useRef<boolean>(false);

    // motion/smoothing
    const latestMultRef = useRef<number>(1.0);
    const smoothedMultRef = useRef<number>(1.0);
    const prevAnimTimeRef = useRef<number | null>(null);
    const animIdRef = useRef<number | null>(null);

    // keep latest values for closures
    const pointsRef = useRef<RoundPoint[]>([]);
    useEffect(() => { pointsRef.current = points; }, [points]);

    const roundActiveRef = useRef<boolean>(false);
    useEffect(() => { roundActiveRef.current = roundActive; }, [roundActive]);

    // ===== Auth check =====
    useEffect(() => {
        (async () => {
            const isValid = await validateToken();
            setTokenValid(isValid);
            if (!isValid) window.location.href = "/login";
        })();
    }, []);

    // ===== RAF loop =====
    const startAnim = () => {
        if (animIdRef.current != null) return;

        const animate = () => {
            if (!roundActiveRef.current || roundStartRef.current == null) {
                animIdRef.current = null;
                return;
            }

            const now = performance.now();
            const t = Math.max(0, (now - roundStartRef.current) * X_SPEED);

            // time-based exponential smoothing toward latest tick value
            const dt = prevAnimTimeRef.current == null ? 16 : Math.max(1, now - prevAnimTimeRef.current);
            prevAnimTimeRef.current = now;
            const k = 1 - Math.exp(-dt / TAU_MS); // 0..1
            smoothedMultRef.current = Math.max(
                1.0,
                smoothedMultRef.current + (latestMultRef.current - smoothedMultRef.current) * k
            );

            const m = smoothedMultRef.current;

            // append a reasonably dense path
            setPoints(prev => {
                const last = prev.at(-1);
                if (last && t - last.t < 20) return prev; // ~50 points/sec
                const next = [...prev, { t, multiplier: m, status: "active" as const }];
                const MAX_POINTS = 2000;
                return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
            });

            animIdRef.current = requestAnimationFrame(animate);
        };

        animIdRef.current = requestAnimationFrame(animate);
    };

    const stopAnim = () => {
        if (animIdRef.current != null) {
            cancelAnimationFrame(animIdRef.current);
            animIdRef.current = null;
        }
    };

    // ===== WebSocket (auto-reconnect). Depends ONLY on tokenValid =====
    useEffect(() => {
        if (tokenValid !== true) return;

        let stopped = false;
        let retry = 1000; // ms backoff

        const connect = () => {
            if (stopped) return;

            const ws = new WebSocket(endpoints.gameWebSocket);
            wsRef.current = ws;

            ws.onopen = () => {
                retry = 1000;
                const token = localStorage.getItem("token");
                if (token) ws.send(JSON.stringify({ token }));
            };

            ws.onmessage = (event) => {
                let data: any;
                try { data = JSON.parse(event.data); } catch { return; }

                // Rising tick: update latest value; RAF handles motion
                if (typeof data.rising === "number") {
                    const now = performance.now();
                    latestMultRef.current = Math.max(1.0, data.rising);

                    // Start of a (new) round?
                    if (crashedRef.current || !roundActiveRef.current || pointsRef.current.length === 0) {
                        roundStartRef.current = now;
                        crashedRef.current = false;
                        latestMultRef.current = Math.max(1.0, data.rising);

                        // reset smoothing
                        smoothedMultRef.current = latestMultRef.current;
                        prevAnimTimeRef.current = null;

                        setPoints([{ t: 0, multiplier: 1.0, status: "active" }]);
                        roundActiveRef.current = true;
                        setRoundActive(true);
                        startAnim();
                        return;
                    }
                }

                // Crash event: stop anim and mark crash
                if (typeof data.crash === "number") {
                    const now = performance.now();
                    const t = Math.max(0, (now - (roundStartRef.current ?? now)) * X_SPEED);
                    stopAnim();
                    roundActiveRef.current = false;
                    setRoundActive(false);
                    crashedRef.current = true;
                    setPoints(prev => [...prev, { t, multiplier: data.crash, status: "crashed" }]);
                }
            };

            ws.onerror = () => {
                // ensure close triggers reconnect
                try { ws.close(); } catch {}
            };

            ws.onclose = () => {
                stopAnim();
                roundActiveRef.current = false;
                setRoundActive(false);
                if (!stopped) {
                    setTimeout(connect, retry);
                    retry = Math.min(retry * 2, 10000);
                }
            };
        };

        connect();

        return () => {
            stopped = true;
            stopAnim();
            wsRef.current?.close();
        };
    }, [tokenValid]);

    // ===== Actions =====
    const sendWS = (payload: any) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        ws.send(JSON.stringify(payload));
    };
    const handlePlaceBet = () => sendWS({ action: "place_bet", bet: betAmount });
    const handleCashout = () => sendWS({ action: "cashout" });
    const handleLogout = () => { localStorage.removeItem("token"); window.location.href = "/login"; };

    if (tokenValid === null) return <p>Checking token...</p>;
    if (!tokenValid) return null;

    const latest = points.at(-1)?.multiplier ?? 1.0;

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="title">CRASH</div>
                <button className="btn logout" onClick={handleLogout}>Logout</button>
            </header>

            <main className="dashboard-main">
                <section className="game-area">
                    <div className="round-info">
                        <div>Status: {roundActive ? "active" : (crashedRef.current ? "crashed" : "idle")}</div>
                        <div className="multiplier">{latest.toFixed(2)}x</div>
                    </div>

                    <div className="chart-placeholder">
                        <Graph data={points} />
                    </div>

                    <div className="actions">
                        <button className="btn place" onClick={handlePlaceBet}>Place Bet</button>
                        <button className="btn cashout" onClick={handleCashout}>Cashout</button>
                    </div>
                </section>

                <aside className="sidebar">
                    <div className="box">
                        <h3>Your Bet</h3>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseFloat(e.target.value || "0"))}
                        />
                        <div className="bet-actions">
                            <button className="btn place" onClick={handlePlaceBet}>Place</button>
                            <button className="btn clear" onClick={() => setBetAmount(0)}>Clear</button>
                        </div>
                    </div>

                    <div className="box">
                        <h3>Announcements</h3>
                        <p>Welcome! Place your bet.</p>
                    </div>
                </aside>
            </main>

            <footer className="dashboard-footer">
                <div>© Crash Game Studio</div>
            </footer>
        </div>
    );
}

export { Dashboard };

// ===== Graph =====
function Graph({ data }: { data: RoundPoint[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Hi-DPI
        const dpr = window.devicePixelRatio || 1;
        const CSS_W = 520, CSS_H = 260;
        canvas.width = CSS_W * dpr;
        canvas.height = CSS_H * dpr;
        canvas.style.width = CSS_W + "px";
        canvas.style.height = CSS_H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.clearRect(0, 0, CSS_W, CSS_H);
        if (data.length === 0) return;

        const padding = 16;
        const w = CSS_W - padding * 2;
        const h = CSS_H - padding * 2;

        // X scale: fixed window; slide after WINDOW_S is filled
        const windowMs = WINDOW_S * 1000;
        const lastT = data[data.length - 1].t;
        const xMin = lastT < windowMs ? 0 : lastT - windowMs;
        const xMax = xMin + windowMs;
        const xScale = (t: number) =>
            padding + ((Math.min(Math.max(t, xMin), xMax) - xMin) / (xMax - xMin)) * w;

        // Y scale: auto to current max, min 2x
        const maxMult = Math.max(2, ...data.map(p => p.multiplier));
        const yScale = (m: number) => CSS_H - padding - (m / maxMult) * h;

        // grid
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, CSS_H - padding); ctx.lineTo(CSS_W - padding, CSS_H - padding);
        ctx.moveTo(padding, padding);         ctx.lineTo(padding, CSS_H - padding);
        ctx.stroke();

        // Y ticks
        ctx.fillStyle = "#888";
        ctx.font = "12px sans-serif";
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const m = 1 + (i * (maxMult - 1)) / ySteps;
            const y = yScale(m);
            ctx.globalAlpha = 0.25;
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(CSS_W - padding, y); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.fillText(`${m.toFixed(2)}x`, 4, y - 2);
        }

        // X ticks (seconds within visible window)
        for (let i = 0; i <= WINDOW_S; i++) {
            const t = xMin + (i * windowMs) / WINDOW_S;
            const x = xScale(t);
            ctx.globalAlpha = 0.25;
            ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, CSS_H - padding); ctx.stroke();
            ctx.globalAlpha = 1;
            const sec = Math.round((t - xMin) / 1000);
            ctx.fillText(`${sec}s`, x - 8, CSS_H - 2);
        }

        // line (rounded joins/caps for a smooth look)
        ctx.beginPath();
        ctx.strokeStyle = "#a88df0";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        data.forEach((p, i) => {
            const x = xScale(p.t);
            const y = yScale(p.multiplier);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // crash marker
        const last = data[data.length - 1];
        if (last.status === "crashed") {
            const x = xScale(last.t);
            const y = yScale(last.multiplier);
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        }
    }, [data]);

    return <canvas ref={canvasRef} />;
}
