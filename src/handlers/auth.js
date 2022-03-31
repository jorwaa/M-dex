const axios = require('axios');

function login(req, res) {
    const endpoint = 'https://api.mangadex.org/auth/login';
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    if (!password || (!username && !email)) {
        console.log("Missing credentials");
        res.status(400).json({
            "status": 400,
            "errors": "missing credentials"
        });
        return;
    }

    const config = {
        headers: {
            "Content-Type": "application/json"
        }
    }
    const data = {
        "username": username,
        "email": email,
        "password": password 
    }
    axios.post(endpoint, data, config)
    .then((response) => {
            res.json(response.data)
        })
    .catch(err => {
        console.log("unsuccessful login respone");
        res.json({
            "status": err.status,
            "errors": err.message,
        })
    })
}

function checkToken(req, res) {
    const endpoint = 'https://api.mangadex.org/auth/check';
    const token = req.params.token;
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    axios.get(endpoint, config)
    .then(response => {
        res.json({
            "result": "ok",
            "isAuthenticated": response.data.isAuthenticated}
    )})
    .catch(err => {
        res.json({
            "result": "error",
            "error": err
        })
    })
}

function refreshSession(req, res) {
    const endpoint = 'https://api.mangadex.org/auth/refresh';
    const token = req.body.token;
    const config = {
        headers: {
            'Content-Type': `application/json`
        }
    }
    const data = {
        "token": token
    }

    axios.post(endpoint, data, config)
    .then((response) => {
        console.log("Token refreshed");
        res.json(response.data)
    })
    .catch(err => {
        console.log("Not able to refresh session token");
        res.json({
            "status": err.status,
            "errors": err.message,
        })
    })
}

module.exports = {
    login,
    checkToken,
    refreshSession
}