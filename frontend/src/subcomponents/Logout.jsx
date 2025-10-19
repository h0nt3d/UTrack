import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"
import {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import LoginFailed from "./LoginFailed";

export default function Logout ({styl}) {
    const loc = useLocation();
    const navigate = useNavigate();
    const {email} = loc.state || {};
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
	async function fetchUser() {
		try {
			const response = await fetch(`http://localhost:5000/user/${encodeURIComponent(email.toLowerCase())}`);
			const data = await response.json();
			setUser(data);
		}
		catch(err) {
			console.error("Error fetching user data", err);
		}
		finally {
			setLoading(false)
		}
	}
	 if (email) fetchUser();

	 else {
		setError("No email provided");
		setLoading(false);
	 }
  }, [email]);

    if (loading) return <p>Loading your profile...</p>

    if (error || !user) {
	return (<LoginFailed />);
    }

    return (
        <div className={styl.header}>

            <button className={styl.prof_button}>
                <img src={profile} alt="profile" className={styl.img}/>
                <h3 className={styl.name}>{user.firstName} {user.lastName}</h3>
            </button>

            <button className={styl.log}>
                <h3>Log Out</h3>
            </button>
        </div>
    );
}
