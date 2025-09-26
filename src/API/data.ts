const API = 'http://localhost:8080';
const APIWS = 'ws://localhost:8080';


const endpoints = {
    login: `${API}/login`,
    register: `${API}/users`,
    gameWebSocket: `${APIWS}/ws/round`,
}

export { endpoints };