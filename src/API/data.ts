const API = 'http://192.168.0.101:8002';
const APIWS = 'ws://192.168.0.101:8002';


const endpoints = {
    login: `${API}/login`,
    register: `${API}/users`,
    gameWebSocket: `${APIWS}/ws/round`,
    validateToken: `${API}/validate-token`,
}

export { endpoints };