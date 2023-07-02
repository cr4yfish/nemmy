import { LemmyHttp, Login } from "lemmy-js-client"


/**
 * Logs in user and returns jwt. Throws error if login fails.
 * @param username string
 * @param password string
 * @returns jwt string
 */
async function userLogin(username: string, password: string) {
    let baseUrl = "https://lemmy.ml";
    let client: LemmyHttp = new LemmyHttp(baseUrl);
    let loginForm: Login = {
        username_or_email: username,
        password: password
    }
    let jwt = (await client.login(loginForm)).jwt;
    if(!jwt) throw new Error("Login failed");
    return jwt;
}



export default function Login() {

    return (
        <>

            <div>
                <h1>login</h1>
                <form action="">
                    <label htmlFor="">Username</label>
                    <input type="text" />
                    <label htmlFor="">Password</label>
                    <input type="password" />
                </form>
                
            </div>

        </>
    )
}