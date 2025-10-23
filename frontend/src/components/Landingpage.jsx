import {useNavigate} from "react-router-dom";

export default function Signup() {

	const navigate = useNavigate();
	 
	async function handleSubmit() {
		navigate("/signup", {});
	}

  return (
	 <div className="flex items-center justify-center h-screen bg-gray-100"> 
		<form className="bg-white p-8 rounded-lg shadow-md w-96">
		  <div className="flex gap-2">
		    <button
		      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
		      type="button"
	              onClick={handleSubmit}>
		      Instructors
		    </button>
		    <button
		      className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
		      type="button"
		    >
		      Students
		    </button>
		  </div>
		</form>
	  </div>
  );
}
