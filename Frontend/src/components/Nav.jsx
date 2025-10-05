import { Link, useLocation } from "react-router-dom";

function Nav() {
  const location = useLocation();

  return (
    <>
      <div className="absolute top-10 left-0 right-0 z-50 flex flex-row w-screen items-center justify-center gap-10 bg-transparent pointer-events-auto">
        <Buttonn text="HOME" to="/" active={location.pathname === "/"} />
        <Buttonn
          text="DATA"
          to="/data"
          active={location.pathname === "/data"}
        />
        <Buttonn
          text="PREDICTION"
          to="/predictions"
          active={location.pathname === "/predictions"}
        />
        <Buttonn
          text="ABOUT"
          to="/about"
          active={location.pathname === "/about"}
        />
      </div>
    </>
  );
}

export default Nav;

function Buttonn({ text, to, active }) {
  return (
    <Link to={to} className="no-underline">
      <button
        className={`text-white text-[20px] p-2 rounded-[5px] pop transition-all
          ${active ? "bg-blue-900 bg-opacity-50" : "hover:bg-zinc-800"}
        `}
      >
        {text}
      </button>
    </Link>
  );
}
