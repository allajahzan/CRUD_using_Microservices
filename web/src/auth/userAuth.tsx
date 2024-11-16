import { jwtDecode } from "jwt-decode"

// check weather token expired or not
const isTokenExpired = (token: string) => {
    if (!token) return true
    const decodedToken: any = jwtDecode(token)
    return decodedToken.exp * 1000 < Date.now()
}

// refresh access token
async function refreshAccessToken() {
    try {
        const resp = await fetch('http://localhost/user/refreshToken', {
            method: 'GET',
            credentials: 'include'
        });
        if (resp.status === 403) {
            return null
        } else {
            const data = await resp.json()
            return data.newAccessToken
        }
    }
    catch (err) {
        console.log(err)
        return null
    }
}

// verify access token
export const verifyToken = (accessToken: string) => fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/user/verifyToken`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    },
})
    .then(async (res) => {
        if (res.status === 403) {
            const newAccessToken = await refreshAccessToken()
            if (newAccessToken) {
                return newAccessToken
            } else {
                return null
            }
        }
        return accessToken
    })
    .catch((err) => {
        console.log(err)
        return false
    })


export async function UserAuth(accessToken: string) {
    // main logic
    if (isTokenExpired(accessToken)) {
        const newAccessToken = await refreshAccessToken()
        if (newAccessToken) {
            return newAccessToken
        }
        return null
    } else {
        return await verifyToken(accessToken)
    }
}
