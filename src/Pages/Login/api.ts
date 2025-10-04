import { endpoints } from "../../API/data.ts";

const FetchLogin = (username: string, password: string) => {
    fetch(endpoints.login, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
    .then(async (res) => {
        if (!res.ok) {}
        else {
            const json = await res.json();
            localStorage.setItem('token', json.access_token)
            window.location.href = '/'
        }
    })
    .catch((err) => {console.log(err)})
}

export { FetchLogin };