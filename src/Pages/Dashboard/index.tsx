import {useState, useEffect} from 'react';
import {log} from '../../Components/Logger';
import {connectToWebsocket} from './api';


import "./index.css";

function Dashboard() {
    const [balance, setBalance] = useState<number>(0);
    const [gameState, setGameState] = useState({
        betPlaced: {
            panel_1 : false,
            panel_2 : false,
        },
        mode: {
            panel_1 : "manual",
            panel_2 : "manual",
        }
    })
    const [ws, setWs] = useState<WebSocket>()
    const [graphValue, setGraphValue] = useState<number>(1.0);
    const [betPanels, setBetPanels] = useState(
        {
            top : {
                value: balance >= 1 ? 1 : 0,
            },
            bottom: {
                value: balance >= 1 ? 1 : 0,
            }
        }
    )

    const updateGraph = (graphValue: number) => {
        setGraphValue(graphValue);

    }

    const updateBetPanels = (panel: string, value: number) => {
        if (value <= 0) {
            log(`No balance available!`, {type: 'error', ttl: 3000})
            return;
        }
        if (value > balance) {
            setBetPanels((prevState) => ({
                ...prevState,
                [panel] : {
                    value: balance
                }
            }))
            log(`The maximum amount available: ${balance} TZS`, {type: 'error', ttl: 3000})
            return;
        }

        setBetPanels((prevState) => ({
            ...prevState,
            [panel] : {
                value: value
            }
        }))
    }

    const placeBetAction = (bet_amount: number, ui_panel: 1 | 2) => {
        if (bet_amount <= 0) {
            log(`No funds available!`, {type: 'error', ttl: 3000})
            return;
        }
        if (!gameState.betPlaced.panel_1 && !gameState.betPlaced.panel_2) {
            if (ws) {
                const data = {
                    action: "place_bet",
                    bet: bet_amount,
                    ui_panel: ui_panel,
                }
                ws.send(JSON.stringify(data))
            }
        }
    }

    const cashoutAction = () => {
        if (gameState.betPlaced) {

            if (ws) {
                const data = {
                    action: "cashout",
                }
                ws.send(JSON.stringify(data))
            }
        }
    }

    const changeGameState = (newGameState: object) => {
        setGameState((prevState) => ({
            ...prevState,
            ...newGameState,
        }))
    }

    const handleGameModeChange = (mode: "manual" | "auto", panel: 1 | 2) => {
        if (panel === 1) {
            setGameState((prevState) => ({
                ...prevState,
                mode : {
                    panel_1: mode,
                    panel_2: prevState.mode.panel_2,
                }
            }))
        }
        else if (panel === 2) {
            setGameState((prevState) => ({
                ...prevState,
                mode : {
                    panel_1: prevState.mode.panel_1,
                    panel_2: mode
                }
            }))
        }
    }
    useEffect(()=> {
        const ws = connectToWebsocket(updateGraph, changeGameState, log, setBalance);
        setWs(ws);
    },[])
    return (
        <div className="aviator-page">
            {/* Top app header (brand + balance + icons) */}
            <div className="brandbar">
                <div className="brand">
                    <span className="aviator-logo">Crash Game</span>
                </div>
                <div className="brand-actions">
                    <div className="balance">
                        <span className="amount">{balance}</span>
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

                    <div className="big-mult">{graphValue.toFixed(2)}x</div>

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
                    <button className={`seg-btn ${gameState.mode.panel_1 === 'manual'  ? 'active' : ''}`} onClick={() => {
                        handleGameModeChange('manual', 1)
                    }}>Bet</button>
                    <button className={`seg-btn ${gameState.mode.panel_1 === 'manual'  ? '' : 'active'}`} onClick={() => {
                        handleGameModeChange('auto', 1)
                    }}>Auto</button>
                </div>

                <div style={{display: `${gameState.mode.panel_1 === 'manual' ? 'flex' : 'none'}`, justifyContent: "space-between", gap: "0.5rem", width: "100%"}}>
                    <div className="bet-row" style={{display: "flex", flexDirection: "column"}}>
                        <div className="amount-box">
                            <button className="round minus" onClick={()=>{

                                updateBetPanels('top', betPanels.top.value - 1)
                            }}>−</button>
                            <div className="amount-text">
                                <span className="amt">{betPanels.top.value}</span>
                            </div>
                            <button className="round plus" onClick={()=>{
                                updateBetPanels('top', betPanels.top.value + 1)
                            }}>＋</button>
                        </div>
                        <div className="quick-grid">
                            <div className="quick-grid">
                                <button className="qbtn" onClick={()=>{
                                    updateBetPanels('top', 500)
                                }}>500</button>
                                <button className="qbtn" onClick={()=>{
                                    updateBetPanels('top', 1000)
                                }}>1,000</button>
                                <button className="qbtn" onClick={()=>{
                                    updateBetPanels('top', 2000)
                                }}>2,000</button>
                                <button className="qbtn" onClick={()=>{
                                    updateBetPanels('top', 5000)
                                }}>5,000</button>
                            </div>
                        </div>
                    </div>
                    <button className={`bet-cta ${gameState.betPlaced.panel_1 ? '' : 'display'}`} onClick={()=>{
                        placeBetAction(betPanels.top.value, 1);
                    }}>
                        <span className="bet-cta-title">Bet</span>
                        <span className="bet-cta-amt">{betPanels.top.value} TZS</span>
                    </button>
                    <button className={`bet-cta-cash-out ${gameState.betPlaced.panel_1 ? 'display' : ''}`} onClick={cashoutAction}>
                        <span className="bet-cta-cash-out-title">Cash Out</span>
                        <span className="bet-cta-cash-out-amt"></span>
                    </button>
                </div>

            </div>

            {/* Bet panel 2 (duplicate, as in screenshot) */}
            <div className="bet-card">
                <div className="seg">
                    <button className={`seg-btn ${gameState.mode.panel_2 === 'manual'  ? 'active' : ''}`} onClick={() => {
                        handleGameModeChange('manual', 2)
                    }}>Bet</button>
                    <button className={`seg-btn ${gameState.mode.panel_2 === 'manual'  ? '' : 'active'}`} onClick={() => {
                        handleGameModeChange('auto', 2)
                    }}>Auto</button>
                </div>

                <div style={{display: `${gameState.mode.panel_2 === 'manual' ? 'flex' : 'none'}`, justifyContent: "space-between", gap: "0.5rem", width: "100%"}}>
                    <div className="bet-row" style={{display: "flex", flexDirection: "column"}}>
                        <div className="amount-box">
                            <button className="round minus" onClick={()=>{
                                updateBetPanels('bottom', betPanels.bottom.value - 1)
                            }}>−</button>
                            <div className="amount-text">
                                <span className="amt">{betPanels.bottom.value}</span>
                            </div>
                            <button className="round plus" onClick={()=>{
                                updateBetPanels('bottom', betPanels.bottom.value + 1)
                            }}>＋</button>
                        </div>
                        <div className="quick-grid">
                            <button className="qbtn" onClick={()=>{
                                updateBetPanels('bottom', 500)
                            }}>500</button>
                            <button className="qbtn" onClick={()=>{
                                updateBetPanels('bottom', 1000)
                            }}>1,000</button>
                            <button className="qbtn" onClick={()=>{
                                updateBetPanels('bottom', 2000)
                            }}>2,000</button>
                            <button className="qbtn" onClick={()=>{
                                updateBetPanels('bottom', 5000)
                            }}>5,000</button>
                        </div>
                    </div>
                    <button className={`bet-cta ${gameState.betPlaced.panel_2 ? '' : 'display'}`} onClick={()=>{
                        placeBetAction(betPanels.bottom.value, 2);
                    }}>
                        <span className="bet-cta-title">Bet</span>
                        <span className="bet-cta-amt">{betPanels.bottom.value} TZS</span>
                    </button>
                    <button className={`bet-cta-cash-out ${gameState.betPlaced.panel_2 ? 'display' : ''}`} onClick={cashoutAction}>
                        <span className="bet-cta-cash-out-title">Cash Out</span>
                        <span className="bet-cta-cash-out-amt"></span>
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
