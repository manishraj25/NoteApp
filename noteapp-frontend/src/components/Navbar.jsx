import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
      <div>
      <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">iNotes</h1>
      </div>
      
      
      <div className="flex items-center space-x-6">

        {!token ? (
          <>
            <Link to="/login" className="hover:text-yellow-400 text-base md:text-xl transition">
              Login
            </Link>
            <Link to="/signup" className="hover:text-yellow-400 text-base md:text-xl transition">
              Signup
            </Link>
          </>
        ) : (
          <>
            <Link to="/notes" className="hover:text-yellow-400 text-base md:text-xl transition">
              Notes
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 text-sm md:text-base rounded-md transition"
            >
              Logout
            </button>
          </>
        )}
      </div>

      
    </nav>
  );
}

