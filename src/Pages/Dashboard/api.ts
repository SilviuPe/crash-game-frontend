import {endpoints} from '../../API/data';

const connectToWebsocket = (
    callbackUpdateGraph: (graphValue: number) => void,
    updateGameState: (newState: object) => void,
    logger: (text: string, opts: object) => void,
    setBalance: (amount: number) => void) => {

    const ws = new WebSocket(endpoints.gameWebSocket)
    const token = localStorage.getItem('token')
    if (!token) {
        ws.close()
        window.location.href = '/login';
    }

    ws.onopen = () => {
        console.log("✅ Connected to WebSocket server");
        ws.send(JSON.stringify({'token' : token}))
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if ("balance" in data) {
            if (data.balance > 0) {
                console.log("Test1: ", data.balance > 0)
                setBalance(parseFloat(data.balance));
            }
            else {
                setBalance(0)
                console.log("Test2: ", data.balance > 0)
            }
        }

        if (data.message) {
            if (data.message === 'Connection established') {
                logger(data.message, {state: 'success', ttl: 3000})
            }
            // if (data.bet_balance) {
            //     setBalance(Number(data.balance))
            //     logger(`Your balance: ${data.bet_balance}`, {state: 'success', ttl: 3000})
            // }
            else if (data.message === "Invalid token") {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            else if (data.message === "Bet Placed") {
                if (data.ui_panel) {
                    if (data.ui_panel === 1) {
                        updateGameState({
                            betPlaced: {
                                panel_1 : true,
                                panel_2 : false,
                            }
                        })
                    }
                    else if (data.ui_panel === 2) {
                        updateGameState({
                            betPlaced: {
                                panel_1 : false,
                                panel_2 : true,
                            }
                        })
                    }
                }
                logger('Bet placed successfully', {type: 'success', ttl: 3000})
            }
            else if (data.message === "You cannot place a bet right now!") {
                logger('You cannot place a bet right now!', {type: 'error', ttl: 3000})
            }
            else if (data.event) {
                if (data.event === "cashout") {
                    logger(data.message, {type: data.status, ttl: 3000})
                    if (data.status === "success") {
                        updateGameState({
                            betPlaced: {
                                panel_1 : false,
                                panel_2 : false,
                            }
                        })
                    }
                }
            }
        }
        if (data.crash) {
            updateGameState({
                betPlaced: {
                    panel_1 : false,
                    panel_2 : false,
                },
            })
        }

        if (data.rising) {
            callbackUpdateGraph(data.rising);
        }
    };

    ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
        console.log("🔌 WebSocket connection closed");
    };

    return ws;
}

export {connectToWebsocket};


