const API = 'http://localhost:8081';
const APIWS = 'ws://localhost:8081';


const endpoints = {
    login: `${API}/login`,
    register: `${API}/users`,
    gameWebSocket: `${APIWS}/ws/round`,
    validateToken: `${API}/validate-token`,
}

export { endpoints };