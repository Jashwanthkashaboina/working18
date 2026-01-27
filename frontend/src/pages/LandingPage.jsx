import '../landingPage.css';
import { Link } from 'react-router-dom';
export default function LandingPage() {
    return ( 
        <div className='landingPageContainer'>
            <nav className='navbar'>
                <div className="nav-header">
                    <h2>Apna Video Call</h2>
                </div>
                <div className="nav-list">
                    <p>Join as a Guest</p>
                    <p>Register</p>
                    <div role='button'>
                        <p>Login</p>
                    </div>
                    
                </div>
            </nav>
            <div className="landingPage-body">
                <div>
                    <h1><span style={{color: '#FF9839'}}>Connect</span> with your Loved Ones</h1>
                    <p>cover a distance by Apna Video call</p>
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
