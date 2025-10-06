import {endpoints} from '../../API/data';

const connectToWebsocket = (callbackUpdateGraph: (graphValue: number) => void ) => {
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
}

export {connectToWebsocket};

