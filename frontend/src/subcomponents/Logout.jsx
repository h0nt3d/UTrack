import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"
import {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";


export default function Logout ({styl}) {
    const loc = useLocation();
    const {email} = loc.state || {};
    const [user, setUser] = useState(null);

    useEffect(() => {
	async function fetchUser() {
		try {
			const response = await fetch(`http://localhost:5000/user/${email}`);
			const data = await response.json();
			setUser(data);
		}
		catch(err) {
			console.error("Error fetching user data", err);
		}
	}
	 if (email) fetchUser();
  }, [email]);

    if (!user) return <p>Loading your profile...</p>

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
