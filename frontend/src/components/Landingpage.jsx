import logo from "../imagez/utrack-rbg.png";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, UserCheck, LogIn } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();

  const goStudent = () => navigate("/student-signup");
  const goInstructor = () => navigate("/instructor-signup");
  const goClaim = () => navigate("/first-time-login");
  const goLogin = () => navigate("/login");

  const Card = ({ Icon, title, onClick, "data-testid" : testid }) => (
    <div
      className="
        group relative w-72 bg-white rounded-2xl shadow-md
        border-t-4 border-black/90
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl
      "
    >
      <div className="p-8 flex flex-col items-center text-center">
        <Icon size={52} strokeWidth={1.75} className="mb-4 text-black" />
        <h3 className="font-semibold text-lg text-black mb-4">{title}</h3>
        <button
          type="button"
          onClick={onClick}
          data-testid={testid}
          className="
            inline-flex items-center justify-center
            h-10 w-10 rounded-md
            bg-black text-white
            shadow-sm
            transition-all duration-200
            hover:scale-105 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-black/40
          "
        >
          →
        </button>
      </div>

      <span
        className="
          pointer-events-none absolute inset-x-0 top-0 h-1.5
          bg-black/90 rounded-t-2xl
          transition-all duration-200
          group-hover:h-2
        "
      />
    </div>
  );

  return (
    <div
      className="
        min-h-screen w-full
        flex flex-col items-center justify-center
        bg-gradient-to-b from-sky-300 to-sky-100
      "
    >
      <div className="flex flex-col items-center mb-8">
        <img
          src={logo}
          alt="UTrack Logo"
          className="w-60 h-30 object-contain mb-2 drop-shadow"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        <Card Icon={GraduationCap} data-testid="landing-studentSignUp" title="Student Sign Up" onClick={goStudent} />
        <Card Icon={Users} data-testid="landing-instructorSignUp" title="Instructor Sign Up" onClick={goInstructor} />
        <Card Icon={UserCheck} data-testid="landing-studentFirstLogin" title="Student First Time Login" onClick={goClaim} />
        <Card Icon={LogIn} data-testid="landing-login" title="Login" onClick={goLogin} />
      </div>
    </div>
  );
}
