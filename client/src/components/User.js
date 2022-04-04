import { faThList } from "@fortawesome/free-solid-svg-icons";
import React from "react";


import defaultParameters from './defaultParameters';
import ChapterList from './ChapterList'
import Login from './Login'

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: {},
            lastRefresh: "",
        }

        //Event handlers:
        this.checkSession = this.checkSession.bind(this);
        this.checkRefreshToken = this.checkRefreshToken.bind(this);
        this.setToken = this.setToken.bind(this);
    }

    render() {
        const isAuthenticated = this.checkSession();
        if (!isAuthenticated)
            this.checkRefreshToken();

        console.log("Render() <- User component");
        if (isAuthenticated) {
            return (
            <div className="userContent">
                <ChapterList 
                    endpoint={defaultParameters.user.endpoint}
                    isAuthenticated={defaultParameters.user.isAuthenticated}
                    queryParams={defaultParameters.user.latest}
                />
            </div>
            )
        }else {
            return (
                <div className="userContent">
                    <Login 
                        setToken={(token => this.setState({'token': token}))}
                        tokenGenerated={(t) => this.setState({lastRefresh: t})}
                    />
                </div>
            )
        }
    }

    componentDidMount() {
        if (this.checkSession || this.checkRefreshToken) {
            // Må logge inn!

        }
    }

    setToken(token) {
        this.setState({
            token: token
        })
    }

    checkSession() {
        console.log("Checking if session token is present and valid...");
        const sessionCookie = document.cookie
        .split('; ')
        .find(el => el.startsWith('sessionId='))
        if (sessionCookie == null) {
            console.log("session token cookie not found");
            return false;
        }else {
            console.log("session token cookie found");
            return sessionCookie.split('=')[1];
        }

    }

    checkRefreshToken() {
        const refreshCookie = document.cookie
        .split('; ')
        .find(el => el.startsWith('refreshId='))
        if (refreshCookie == null) {
            console.log("refreshToken cookie not found");
            return false;
        }else {
            console.log("refreshToken cookie found");
            this.refreshSession(refreshCookie.split('=')[1]);
            return refreshCookie.split('=')[1];
        }
    }

    refreshSession(refreshCookie) {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'token': refreshCookie,
            })
        }
        
        fetch('/api/refresh', options)
        .then(response => response.json())
        .then(data => {
            if (data.result == "ok") {

                let time = new Date()
                const sessionLengthMs = 15 * 60 * 1000;
                const refreshLengthMs = 30 * 24 * 60 * 60 * 1000
                const sessionExpiry = new Date();
                const refreshExpiry = new Date();
                sessionExpiry.setTime((time.getTime() + sessionLengthMs))
                refreshExpiry.setTime((time.getTime() + refreshLengthMs));
                
                document.cookie = `sessionId=${data.token.session}; expires=${sessionExpiry.toGMTString()}; SameSite=Lax`
                document.cookie = `refreshId=${data.token.refresh}; expires=${refreshExpiry.toGMTString()}; SameSite=Lax`
                
                console.log("session token refreshed");
                this.setState({
                    lastRefresh: time.getTime()
                })
            }else {
                console.log("sesison refresh failed");
                console.log(data.errors);
            }
        })
    }

}

export default User