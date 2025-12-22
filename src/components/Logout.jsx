import { useNavigate } from 'react-router-dom';
import { TbLogout } from "react-icons/tb";


function Logout({ setAuthToken, setShowLogout }) {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setAuthToken(null);
        navigate("/");
    };

    const handleCancelLogout = () => {
        setShowLogout(false);
    };

    return (
        <div className="logout-overlay">
            <div className="logout-card">
                <TbLogout className="logout-icon" />
                <h2>Do you really want to log out?</h2>
                <div className="logout-buttons">
                    <button className="btn-logout" onClick={handleLogout}>
                        Log Out
                    </button>
                    <button className="btn-cancel" onClick={handleCancelLogout}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Logout;