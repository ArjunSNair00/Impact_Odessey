function Hamburger() {
  return (
    <>
      <div className="flex top-10 left-30 items-center h-screen z-50 absolute">
        <button className="bg-blue-950 p-5 text-3xl rounded-xl mb-30 hover:bg-blue-800 transition-all select-none">
          START MISSION
        </button>
      </div>
      <div className="flex absolute h-screen bottom-20 items-end justify-evenly w-screen">
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop select-none">
          <img src="/icons/analysis.png" className="h-20 w-20 mb-4"></img>
          <span className="pointer-events-none">REAL TIME DATA</span>
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop select-none">
          <img src="/icons/comet1.png" className="h-20 w-20 mb-4"></img>
          <span className="pointer-events-none">IMPACT PREDICTIONS</span>
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop select-none">
          <img src="/icons/simulation.png" className="h-20 w-20 mb-4"></img>
          <span className="pointer-events-none">INTERACTIVE SIMULATIONS</span>
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop select-none">
          <img src="/icons/coding.png" className="h-20 w-20 mb-4"></img>
          <span className="pointer-events-none">LEARN MORE</span>
        </div>
      </div>
    </>
  );
}

export default Hamburger;
