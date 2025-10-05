import { motion } from "framer-motion";

function Hamburger({ onClose }) {
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div className="mt-[20vh]" variants={itemVariants}>
          <motion.button
            className="bg-blue-950 p-5 text-3xl rounded-xl hover:bg-blue-800 transition-all select-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            START MISSION
          </motion.button>
        </motion.div>

        <motion.div className="fixed bottom-10 left-0 right-0 flex justify-center gap-20 px-4">
          <motion.div
            className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center rounded-xl pop select-none"
            variants={itemVariants}
          >
            <img
              src="/icons/analysis.png"
              className="h-20 w-20"
              alt="Analysis"
            />
            <span className="mt-2">REAL TIME DATA</span>
          </motion.div>

          <motion.div
            className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center rounded-xl pop select-none"
            variants={itemVariants}
          >
            <img src="/icons/comet1.png" className="h-20 w-20" alt="Comet" />
            <span className="mt-2">IMPACT PREDICTIONS</span>
          </motion.div>

          <motion.div
            className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center rounded-xl pop select-none"
            variants={itemVariants}
          >
            <img
              src="/icons/simulation.png"
              className="h-20 w-20"
              alt="Simulation"
            />
            <span className="mt-2">INTERACTIVE SIMULATIONS</span>
          </motion.div>

          <motion.div
            className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center rounded-xl pop select-none"
            variants={itemVariants}
          >
            <img src="/icons/coding.png" className="h-20 w-20" alt="Code" />
            <span className="mt-2">LEARN MORE</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Hamburger;
