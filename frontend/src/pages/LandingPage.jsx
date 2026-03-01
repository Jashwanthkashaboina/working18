import '../landingPage.css';
import { Link, useNavigate } from 'react-router-dom';
export default function LandingPage() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");
    return ( 
        <div className='landingPageContainer'>
            <nav className='navBar'>
                <div className="nav-header">
                    <h2 onClick={() => navigate(isLoggedIn ? "/home" : "/")}>
                        Meet Nest
                    </h2>
                </div>
                {/* <div className="nav-list">
                    <p onClick={
                        () =>{ navigate('/auth'); }
                    }>
                        Register
                    </p>
                    <button onClick={() => navigate('/auth')} className="primaryBtn">
                        Login
                    </button>

                    
                </div> */}
                <div className="nav-list">
                    {isLoggedIn ? (
                        <>
                            <p onClick={() => navigate('/home')}> Home </p>

                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    navigate('/');
                                }}
                                className="primaryBtn"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <p onClick={() => navigate('/auth')}>
                                Register
                            </p>

                            <button
                                onClick={() => navigate('/auth')}
                                className="primaryBtn"
                            >
                                Login
                            </button>
                        </>
                    )}

                </div>
            </nav>
            <div className="landingPage-body">
                <div>
                    <h1><span style={{color: '#FF9839'}}>Connect</span> with your Loved Ones</h1>
                    <p>cover a distance by Meet Nest</p>
                    <div role='button'>
                        <Link to={'/auth'}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src='/mobile.png' alt='Mobile Image'/>
                    
                </div>
            </div>
        </div>
    );
}
