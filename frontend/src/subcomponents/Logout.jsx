import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"
import {useState, useEffect} from "react";
import {useLocation} from "react-router-dom";


export default function Logout ({styl, user: propUser}) {
    const loc = useLocation();
    const {email} = loc.state || {};
    const [user, setUser] = useState(propUser);

    useEffect(() => {
        // If user is passed as prop, use it
        if (propUser) {
            setUser(propUser);
            return;
        }

        // Get user data from localStorage first
        const storedUser = localStorage.getItem('user');
        const storedFirstName = localStorage.getItem('firstName');
        const storedLastName = localStorage.getItem('lastName');
        
        if (storedUser && storedFirstName && storedLastName) {
            try {
                const userData = JSON.parse(storedUser);
                setUser({
                    firstName: storedFirstName,
                    lastName: storedLastName,
                    email: userData.email
                });
            } catch (err) {
                console.error("Error parsing stored user data", err);
                // Fallback to API call if localStorage data is corrupted
                fetchUserFromAPI();
            }
        } else {
            // Fallback to API call if no localStorage data
            fetchUserFromAPI();
        }

        async function fetchUserFromAPI() {
            try {
                const response = await fetch(`http://localhost:5000/user/${email}`);
                const data = await response.json();
                setUser(data);
            }
            catch(err) {
                console.error("Error fetching user data", err);
            }
        }
    }, [email, propUser]);

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
