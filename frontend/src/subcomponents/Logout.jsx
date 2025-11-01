import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png";
import logo from "../imagez/utrack-white.png";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginFailed from "./LoginFailed";

export default function Logout({ styl, user: propUser }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { email } = loc.state || {};
  const [user, setUser] = useState(propUser);
  const [loading, setLoading] = useState(!propUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem("user");
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");

    if (storedUser && storedFirstName && storedLastName) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          firstName: storedFirstName,
          lastName: storedLastName,
          email: userData.email,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error parsing stored user data", err);
        fetchUserFromAPI();
      }
    } else {
      fetchUserFromAPI();
    }

    async function fetchUserFromAPI() {
      if (!email) {
        setError("No email provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/user/${encodeURIComponent(email.toLowerCase())}`
        );
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user data", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    }
  }, [email, propUser]);

  if (loading) return <p>Loading your profile...</p>;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    localStorage.removeItem("token");

    navigate("/login");
  };

  if (error || !user) {
    return <LoginFailed />;
  }

  return (
    <div
      className={styl.header}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      {/* Profile Button */}
      <button className={styl.prof_button} style={{ display: "flex", alignItems: "center" }}>
        <img
          src={profile}
          alt="profile"
          className={styl.img}
          style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "0.5rem" }}
        />
        <h3 className={styl.name}>
          {user.firstName} {user.lastName}
        </h3>
      </button>

      {/* System Logo in the center */}
      <img
        src={logo}
        alt="System Logo"
        style={{ height: "50px", objectFit: "contain", position: "absolute", left: "50%", transform: "translateX(-50%)", }}
      />

      {/* Logout Button */}
      <button className={styl.log} onClick={handleLogout}>
        <h3>Log Out</h3>
      </button>
    </div>
  );
}

