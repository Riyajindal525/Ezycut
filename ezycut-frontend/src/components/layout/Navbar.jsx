import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

const Navbar = () => {
  const navigate = useNavigate();
const user = useAuthStore(
  (state) => state.user
);
  const token = useAuthStore(
    (state) => state.token
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-5 shadow-sm">

      <h1 className="text-2xl font-bold">
        EzyCut
      </h1>

      <div className="flex gap-4">

        {!token ? (
          <>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg border"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-lg bg-black text-white"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            


           <div className="flex items-center gap-4">

  {user && (
    <span className="font-medium">
      Hello, {user.name}
    </span>
  )}

  

   <Link
  to="/notifications"
  className="px-5 py-2 rounded-lg border"
>
  🔔 
</Link>

   <Link
  to="/my-reviews"
  className="px-5 py-2 rounded-lg border"
>
  My Reviews
</Link>

   <Link
  to="/payment-history"
  className="px-5 py-2 rounded-lg border"
>
  Payments
</Link>

   <Link
  to="/my-bookings"
  className="px-5 py-2 rounded-lg border"
>
  My Bookings
</Link>

<Link
  to="/my-queue"
  className="px-5 py-2 rounded-lg border"
>
  My Queue
</Link>

  <button
    onClick={handleLogout}
    className="px-5 py-2 rounded-lg bg-red-500 text-white"
  >
    Logout
  </button>

</div>
          </>
        )}

      </div>

    </nav>
  );
};

export default Navbar;