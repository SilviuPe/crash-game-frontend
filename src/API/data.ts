const API = 'http://localhost:8000';
const APIWS = 'ws://127.0.0.1:8000';


const endpoints = {
    login: `${API}/login`,
    register: `${API}/users`,
    gameWebSocket: `${APIWS}/ws/round`,
    validateToken: `${API}/validate-token`,
}

export { endpoints };