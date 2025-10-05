import React from "react";
import { motion } from "framer-motion";

function About() {
  const teamMembers = [
    {
      name: "Your Name",
      role: "Project Lead",
      description: "Oversaw project development and coordinated team efforts",
    },
    // Add other team members here
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="text-white pt-24 px-8 max-w-7xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-8">
          About Impact Odyssey
        </motion.h1>

        <motion.section
          variants={itemVariants}
          className="bg-zinc-900 p-6 rounded-lg mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
          <p className="text-lg leading-relaxed">
            Impact Odyssey is a comprehensive platform developed for the NASA
            Space Apps Challenge. Our mission is to make complex astronomical
            data accessible and understandable through interactive
            visualizations and simulations. We focus on tracking and analyzing
            potential near-Earth objects (NEOs) and their impact scenarios.
          </p>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="bg-zinc-900 p-6 rounded-lg mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-3">
            <li>Real-time orbital data visualization</li>
            <li>Advanced impact prediction system</li>
            <li>Interactive 3D simulations</li>
            <li>Comprehensive risk assessment tools</li>
            <li>User-friendly parameter controls</li>
          </ul>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="bg-zinc-900 p-6 rounded-lg mb-8"
        >
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Frontend</h3>
              <ul className="list-disc list-inside">
                <li>React</li>
                <li>Three.js</li>
                <li>Framer Motion</li>
                <li>TailwindCSS</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Backend</h3>
              <ul className="list-disc list-inside">
                <li>Python</li>
                <li>Flask</li>
                <li>NumPy</li>
                <li>SciPy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Data Sources</h3>
              <ul className="list-disc list-inside">
                <li>NASA NEO API</li>
                <li>JPL Small-Body Database</li>
                <li>USGS Data</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="bg-zinc-900 p-6 rounded-lg"
        >
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-blue-400">{member.role}</p>
                <p className="mt-2 text-gray-300">{member.description}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

export default About;
