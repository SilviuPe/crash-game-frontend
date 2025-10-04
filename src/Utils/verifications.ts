import { endpoints } from "../API/data.ts";

const validateToken = async (): Promise<boolean> => {
    const tokenValue = localStorage.getItem("token");
    if (tokenValue) {
        try {
            const res = await fetch(endpoints.validateToken, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: tokenValue }),
            });

            return res.ok; // true if status 2xx, false otherwise
        } catch (err) {
            console.error("Error validating token:", err);
            return false;
        }
    }
    else {
        return false;
    }


};

export { validateToken };