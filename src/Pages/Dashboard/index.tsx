import {useEffect} from 'react';
import { validateToken } from '../../Utils/verifications';


function Dashboard() {
    const tokenValid = validateToken()

    useEffect(() => {
        if (!tokenValid) {
            window.location.href = '/login';
        }
    }, [])

    if (!tokenValid) {
        return null;
    }
    else {
        return (
            <>Dashboard</>
        )
    }

}

export { Dashboard };