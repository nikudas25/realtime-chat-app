import { useState } from "react";
import Layout from "../components/Layout";
import Chat from "../components/Chat";

export default function Home()
{
    const [user, setUser] = useState(null);

    function handleKeyUp(evt)
    {
        const value = evt.target.value;

        if(evt.keyCode === 13 && !evt.shiftKey)
        {
            setUser(value);
        }
    }

    return(
        <Layout>
            <main className="container-fluid bg-dark text-light" style={{ height : "100vh",
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#ffffff',
            }}>
                <div className="row h-100">
                    <section className = "col-md-8 d-flex flex-column justify-content-center align-items-center">
                        {!user && (
                            <>
                            <h1>Your name</h1>
                            <input
                                type = "text"
                                className="form-control mt-3"
                                onKeyUp={handleKeyUp}
                                placeholder="Type your name and press Enter"
                                style={{
                                    borderRadius: '50px',
                                    height: '42px',
                                    fontSize: '14pz',
                                    padding: '6px 14px',
                                    width: '500px',
                                    border: 'none',
                                    outline: 'none',
                                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                                }}
                                />
                            </>
                        )}

                        {user && (
                            <h2 className="text-success">Hello, {user}! 👋</h2>
                        )}
                    </section>
                    <section className="col-md-4 bg-light">
                        {user && <Chat activeUser={user} />}
                    </section>
                </div>
            </main>
        </Layout>
    );
}