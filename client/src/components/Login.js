import React from "react";

import './style/User.css'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'username' : "",
            'password': "",
        }

        //Event handlers:
        this.submit = this.submit.bind(this);
    }

    render() {
        //
        return (
            <div className="loginDiv">
                <form className="loginForm" onSubmit={this.submit}>
                    <div className="inputDiv">
                    <label htmlFor="usernameInp"> Username: </label>
                    <input
                        type={'text'} id='usernameInp'
                        value={this.state.username}
                        onChange={e => this.setState({'username': e.target.value})}>
                    </input>
                    </div>
                    <div className="inputDiv">
                    <label htmlFor="passwordInp"> Password: </label>
                    <input
                        type={'password'} id='passwordInp' 
                        value={this.state.password}
                        onChange={e => this.setState({'password': e.target.value})}>
                    </input>
                    </div>
                    <input type="submit" id='loginSubmit' value='Log in' />
                </form>
            </div>
        )
    }

    submit(e) {
        e.preventDefault();
        console.log("Logging in...");
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "",
                username: this.state.username,
                password: this.state.password,
            })
        }
        fetch('/api/login', options)
        .then(response => response.json())
        .then(data => {
            console.log("status: " + data.status)
            if (data.result == "ok") {
                console.log("Login successful!");
                //use props to change parent state:
                let time = new Date()
                const sessionLengthMs = 15 * 60 * 1000;
                const refreshLengthMs = 30 * 24 * 60 * 60 * 1000
                const sessionExpiry = new Date();
                const refreshExpiry = new Date();
                sessionExpiry.setTime((time.getTime() + sessionLengthMs))
                refreshExpiry.setTime((time.getTime() + refreshLengthMs));

                document.cookie = `sessionId=${data.token.session}; expires=${sessionExpiry.toGMTString()}; SameSite=Lax`
                document.cookie = `refreshId=${data.token.refresh}; expires=${refreshExpiry.toGMTString()}; SameSite=Lax`
                this.props.tokenGenerated(time.getTime());
                // TODO
            }else {
                console.log("Login unsuccessful!");
                alert(data.errors)
            }
        })
    }

}

export default Login