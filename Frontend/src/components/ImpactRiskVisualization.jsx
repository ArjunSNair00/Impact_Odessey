import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";

// Constants for visualization
const TORINO_DESCRIPTIONS = {
  0: "No Hazard",
  1: "Normal",
  2: "Merit Attention",
  3: "Merits Concern",
  4: "Threatening",
  5: "Threatening",
  6: "Strong Threat",
  7: "Great Threat",
  8: "Certain Collisions",
  9: "Certain Collisions",
  10: "Global Catastrophe",
};

const LANDMARK_COMPARISONS = [
  { name: "Large City", radius: 15 },
  { name: "Small Country", radius: 100 },
  { name: "Large Country", radius: 500 },
];

const ImpactRiskVisualization = ({ asteroid, riskAssessment }) => {
  const svgRef = useRef();
  const plotRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [plotData, setPlotData] = useState(null);
  const [hazardousList, setHazardousList] = useState([]);
  const [plotLoading, setPlotLoading] = useState(true);
  const [plotError, setPlotError] = useState(null);

  useEffect(() => {
    if (!svgRef.current || !riskAssessment) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create impact visualization
    if (riskAssessment.impact_effects) {
      const { destruction_radius_km, crater_diameter_km, fireball_radius_km } =
        riskAssessment.impact_effects;
      const maxRadius = Math.max(
        destruction_radius_km,
        crater_diameter_km,
        fireball_radius_km
      );

      const scale = d3
        .scaleLinear()
        .domain([0, maxRadius])
        .range([0, Math.min(width, height) / 2]);

      // Draw concentric circles for impact zones with gradients
      const circles = [
        {
          radius: crater_diameter_km / 2,
          color: "#ff4444",
          label: "Crater",
          opacity: 0.8,
          gradient: true,
        },
        {
          radius: fireball_radius_km,
          color: "#ff8800",
          label: "Fireball",
          opacity: 0.6,
          gradient: true,
        },
        {
          radius: destruction_radius_km,
          color: "#ffcc00",
          label: "Destruction Zone",
          opacity: 0.4,
          gradient: true,
        },
      ];

      // Add city scale comparison
      const cityRadius = 15; // Approximate radius of a large city in km
      circles.push({
        radius: cityRadius,
        color: "#ffffff",
        label: "Large City",
      });

      const impactZones = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Create radial gradients
      circles.forEach(({ color, gradient }, i) => {
        if (gradient) {
          const gradientId = `impact-gradient-${i}`;
          const gradient = svg
            .append("defs")
            .append("radialGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("cx", "0")
            .attr("cy", "0")
            .attr("r", "100%");

          gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", color)
            .attr("stop-opacity", 0.4);

          gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", color)
            .attr("stop-opacity", 0.1);
        }
      });

      // Draw circles with animation
      circles.forEach(({ radius, color, label, opacity, gradient }, i) => {
        const circle = impactZones
          .append("circle")
          .attr("r", 0)
          .attr("fill", gradient ? `url(#impact-gradient-${i})` : "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", gradient ? "" : "5,5")
          .attr("opacity", opacity);

        circle
          .transition()
          .duration(1000)
          .delay(i * 200)
          .attr("r", scale(radius));

        // Pulse animation for hazardous zones
        if (radius > 100) {
          circle.call(pulse);
        }

        impactZones
          .append("text")
          .attr("x", scale(radius))
          .attr("y", -10)
          .attr("fill", color)
          .attr("text-anchor", "middle")
          .attr("opacity", 0)
          .text(`${label} (${radius.toFixed(1)} km)`)
          .transition()
          .duration(500)
          .delay(i * 200 + 500)
          .attr("opacity", 1);
      });

      // Add scale bar
      const scaleBar = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left},${height - margin.bottom})`
        );

      const scaleBarWidth = 100;
      const scaleBarKm = scaleBarWidth / scale(1);

      scaleBar
        .append("line")
        .attr("x1", 0)
        .attr("x2", scaleBarWidth)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      scaleBar
        .append("text")
        .attr("x", scaleBarWidth / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(`${scaleBarKm.toFixed(1)} km`);
    }

    // Create Torino Scale visualization
    const torinoScale = svg
      .append("g")
      .attr("transform", `translate(0,${height - 100})`);

    const torinoColors = [
      "#00ff00", // 0 - Green
      "#ffff00", // 1 - Yellow
      "#ffff00", // 2 - Yellow
      "#ffa500", // 3 - Orange
      "#ffa500", // 4 - Orange
      "#ff0000", // 5 - Red
      "#ff0000", // 6 - Red
      "#ff0000", // 7 - Red
      "#ff0000", // 8 - Red
      "#ff0000", // 9 - Red
      "#800080", // 10 - Purple
    ];

    const torinoWidth = width / torinoColors.length;

    torinoColors.forEach((color, i) => {
      torinoScale
        .append("rect")
        .attr("x", i * torinoWidth)
        .attr("width", torinoWidth)
        .attr("height", 20)
        .attr("fill", color)
        .attr("opacity", i === riskAssessment.torino_scale ? 1 : 0.3);

      torinoScale
        .append("text")
        .attr("x", i * torinoWidth + torinoWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(i);
    });

    torinoScale
      .append("text")
      .attr("x", width / 2)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(`Torino Scale: ${riskAssessment.torino_scale}`);
  }, [dimensions, riskAssessment]);

  // Fetch backend impact summary (Plotly-ready payload + hazardous list)
  useEffect(() => {
    let cancelled = false;
    const fetchSummary = async () => {
      try {
        setPlotLoading(true);
        const res = await fetch("/api/impact-summary");
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Unknown error");

        if (cancelled) return;

        setHazardousList(json.hazardous || []);
        setPlotData(json.plotly || null);
        setPlotError(null);
      } catch (err) {
        console.warn("Error loading impact summary", err);
        setPlotError(err.message || String(err));
      } finally {
        setPlotLoading(false);
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ensure Plotly is loaded via CDN and render the plot when data arrives
  useEffect(() => {
    if (!plotData || !plotRef.current) return;

    const ensurePlotly = () =>
      new Promise((resolve, reject) => {
        if (window.Plotly) return resolve(window.Plotly);
        const script = document.createElement("script");
        script.src = "https://cdn.plot.ly/plotly-2.24.1.min.js";
        script.async = true;
        script.onload = () => resolve(window.Plotly);
        script.onerror = (e) => reject(new Error("Failed to load Plotly"));
        document.head.appendChild(script);
      });

    let mounted = true;
    ensurePlotly()
      .then((Plotly) => {
        if (!mounted) return;
        try {
          Plotly.newPlot(plotRef.current, plotData.data, plotData.layout || {});
        } catch (e) {
          console.error("Plotly render error", e);
          setPlotError(String(e));
        }
      })
      .catch((err) => {
        console.error("Failed to load Plotly", err);
        setPlotError(String(err));
      });

    return () => {
      mounted = false;
    };
  }, [plotData]);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } =
          svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!asteroid || !riskAssessment) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute left-5 bottom-24 bg-zinc-900/90 p-4 rounded-lg text-white"
      style={{ width: "400px", height: "500px" }}
    >
      <h3 className="text-lg font-semibold mb-4">Impact Risk Analysis</h3>

      <div className="text-sm mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div>Asteroid:</div>
          <div>{asteroid.name}</div>
          <div>Probability:</div>
          <div>{(riskAssessment.impact_probability * 100).toFixed(6)}%</div>
          <div>Energy:</div>
          <div>
            {riskAssessment.impact_effects?.energy_megatons.toFixed(1)} MT
          </div>
          <div>Palermo Scale:</div>
          <div>{riskAssessment.palermo_scale.toFixed(2)}</div>
        </div>
      </div>

      <div className="relative" style={{ height: "220px" }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      <div className="mt-3">
        <h4 className="font-medium">Hazardous Asteroids</h4>
        {plotLoading && (
          <div className="text-sm">Loading hazard summary...</div>
        )}
        {plotError && <div className="text-sm text-red-400">{plotError}</div>}
        {!plotLoading && !plotError && (
          <div>
            <div ref={plotRef} style={{ height: "180px" }} />

            <ul className="text-sm mt-2 max-h-40 overflow-auto">
              {hazardousList.length === 0 && (
                <li>No hazardous asteroids found.</li>
              )}
              {hazardousList.map((h) => (
                <li key={h.id} className="py-1 border-b border-zinc-800">
                  <div className="flex justify-between">
                    <div>{h.name}</div>
                    <div>{(h.impact_probability * 100).toExponential(3)}%</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImpactRiskVisualization;
