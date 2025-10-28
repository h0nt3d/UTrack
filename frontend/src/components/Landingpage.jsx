import logo from "../imagez/uTrack-logo.png";
import {useNavigate} from "react-router-dom";

export default function Signup() {

	const navigate = useNavigate();
	 
	async function handleSubmit() {
		navigate("/signup", {});
	}

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col items-center">
        <img
          src={logo}
          alt="Banner"
          className="w-50 h-50 mb-6 object-contain"
        />
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-grey-900 transition"
            type="button"
            onClick={handleSubmit}
          >
            Instructors
          </button>
          <button
            className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-grey-900 transition"
            type="button"
          >
            Students
          </button>
        </div>
      </form>
    </div>
  );
}
