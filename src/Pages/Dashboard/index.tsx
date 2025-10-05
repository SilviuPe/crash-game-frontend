import "./index.css";

function Dashboard() {
    return (
        <div className="aviator-page">
            {/* Top app header (brand + balance + icons) */}
            <div className="brandbar">
                <div className="brand">
                    <span className="aviator-logo">Crash Game</span>
                </div>
                <div className="brand-actions">
                    <div className="balance">
                        <span className="amount">660.86</span>
                        <span className="ccy">TZS</span>
                    </div>
                    <button className="icon-btn" aria-label="Menu">
                        <span className="icon-lines" />
                    </button>
                    <button className="icon-btn" aria-label="Chat">
                        <span className="icon-bubble" />
                    </button>
                </div>
            </div>

            {/* Recent multipliers row */}
            <div className="recent-mults">
                {["2.48x","1.39x","1.54x","3.45x","5.57x","2.60x","6.44x","2.08x"].map((v,i)=>(
                    <span key={i} className="chip">{v}</span>
                ))}
            </div>

            {/* Game card */}
            <div className="game-card">
                {/* black rounded frame */}
                <div className="game-frame">
                    <div className="rays" />
                    <div className="glow" />
                    {/* curve + plane */}
                    <svg className="curve" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden>
                        <path d="M0,38 C22,36 40,31 55,22 C70,13 85,7 100,5" />
                    </svg>
                    <svg className="plane" viewBox="0 0 140 64" aria-hidden>
                        <path className="plane-body" d="M20 44 L120 30 L120 34 L20 48 Z" />
                        <path className="plane-wing" d="M78 22 L130 16 L130 20 L78 26 Z" />
                        <circle cx="112" cy="28" r="3" className="plane-hole" />
                    </svg>

                    <div className="big-mult">2.43x</div>

                    <div className="players">
                        <div className="avatars">
                            <div className="av a1" />
                            <div className="av a2" />
                            <div className="av a3" />
                        </div>
                        <div className="players-count">2,766</div>
                    </div>
                </div>
            </div>

            {/* Bet panel 1 */}
            <div className="bet-card">
                <div className="seg">
                    <button className="seg-btn active">Bet</button>
                    <button className="seg-btn">Auto</button>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", gap: "0.5rem", width: "100%"}}>
                    <div className="bet-row" style={{display: "flex", flexDirection: "column"}}>
                        <div className="amount-box">
                            <button className="round minus">−</button>
                            <div className="amount-text">
                                <span className="amt">100.00</span>
                            </div>
                            <button className="round plus">＋</button>
                        </div>
                        <div className="quick-grid">
                            <button className="qbtn">500</button>
                            <button className="qbtn">1,000</button>
                            <button className="qbtn">2,000</button>
                            <button className="qbtn">5,000</button>
                        </div>
                    </div>
                    <button className="bet-cta">
                        <span className="bet-cta-title">Bet</span>
                        <span className="bet-cta-amt">100.00 TZS</span>
                    </button>
                </div>

            </div>

            {/* Bet panel 2 (duplicate, as in screenshot) */}
            <div className="bet-card">
                <div className="seg">
                    <button className="seg-btn active">Bet</button>
                    <button className="seg-btn">Auto</button>
                </div>

                <div style={{display: "flex", justifyContent: "space-between", gap: "0.5rem", width: "100%"}}>
                    <div className="bet-row" style={{display: "flex", flexDirection: "column"}}>
                        <div className="amount-box">
                            <button className="round minus">−</button>
                            <div className="amount-text">
                                <span className="amt">100.00</span>
                            </div>
                            <button className="round plus">＋</button>
                        </div>
                        <div className="quick-grid">
                            <button className="qbtn">500</button>
                            <button className="qbtn">1,000</button>
                            <button className="qbtn">2,000</button>
                            <button className="qbtn">5,000</button>
                        </div>
                    </div>
                    <button className="bet-cta">
                        <span className="bet-cta-title">Bet</span>
                        <span className="bet-cta-amt">100.00 TZS</span>
                    </button>
                </div>

            </div>

            {/* Bottom tabs + totals row */}
            <div className="bottom-card">
                <div className="tabs">
                    <button className="tab active">All Bets</button>
                    <button className="tab">Previous</button>
                    <button className="tab">Top</button>
                </div>

                <div className="totals">
                    <div className="top">
                        <div className="avatars">
                            <div className="av a1" />
                            <div className="av a2" />
                            <div className="av a3" />
                        </div>
                        <div className="tot-win">2,778,106.85</div>

                    </div>

                    <div className="bottom">

                        <span className="bets-text">3982/5816 <span style={{color:"#7B7B7B"}}>Bets</span></span>
                        <div className="tot-label">Total win TZS</div>
                    </div>
                    <div className="bets-line">
                        <div className="bar">
                            <div className="bar-fill" style={{ width: "68%" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Dashboard };
