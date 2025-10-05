function Nav() {
  return (
    <>
      <div className="absolute top-10 left-0 right-0 z-50 flex flex-row w-screen items-center justify-center gap-10 bg-transparent pointer-events-auto">
        <Buttonn text="HOME" />
        <Buttonn text="DATA" />
        <Buttonn text="PREDICTION" />
        <Buttonn text="ABOUT" />
      </div>
    </>
  );
}

export default Nav;

function Buttonn({ text }) {
  return (
    <button className="text-white text-[20px] p-2 rounded-[5px] pop">
      {text}
    </button>
  );
}
