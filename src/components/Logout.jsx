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
                <h2>Voulez-vous vraiment vous déconnecter ?</h2>
                <div className="logout-buttons">
                    <button className="btn-logout" onClick={handleLogout}>
                        Déconnecter
                    </button>
                    <button className="btn-cancel" onClick={handleCancelLogout}>
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Logout;