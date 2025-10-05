from flask import Flask, jsonify, request
from flask_cors import CORS
import math
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route('/api/predict-impact', methods=['POST'])
def predict_impact():
    """Calculate impact effects based on asteroid parameters"""
    try:
        data = request.get_json()
        
        # Extract parameters
        velocity = float(data.get('velocity', 0))      # km/s
        angle = float(data.get('angle', 0))          # degrees
        mass = float(data.get('mass', 0))            # kg
        diameter = float(data.get('diameter', 0))    # meters
        composition = data.get('composition', 'rock') # iron, rock, or ice

        # Validate required parameters
        if not all([velocity, angle, mass, diameter]):
            return jsonify({
                "error": "Missing required parameters"
            }), 400

        # Material density lookup (kg/m³)
        densities = {
            "iron": 7800,
            "rock": 3000,
            "ice": 900
        }
        density = densities.get(composition, densities["rock"])

        # Calculate impact energy (Joules)
        velocity_ms = velocity * 1000  # Convert to m/s
        kinetic_energy = 0.5 * mass * (velocity_ms ** 2)
        energy_megatons = kinetic_energy / (4.184e15)  # Convert to megatons TNT

        # Calculate crater diameter using scaling law
        # Simple crater scaling law: D = 0.012 * (KE)^0.294 * (sin(angle))^0.333
        impact_angle_rad = math.radians(angle)
        crater_diameter = 0.012 * (kinetic_energy ** 0.294) * (math.sin(impact_angle_rad) ** 0.333) / 1000  # km

        # Fireball radius (km)
        # R = 0.07 * (E)^0.333 where E is energy in megatons
        fireball_radius = 0.07 * (energy_megatons ** 0.333)

        # Tsunami height estimation (if impact in ocean)
        # h = 1000 * (E)^0.25 / d where d is distance in km (using 1km as reference)
        tsunami_height = 1000 * (energy_megatons ** 0.25)  # meters at 1km distance

        # Calculate impact probability based on size and velocity
        # Simplified model for demonstration
        impact_probability = min(0.95, (diameter/1000) * (velocity/50))

        # Current time and simulated impact time
        current_time = datetime.now()
        impact_time = current_time + timedelta(days=7)  # Simulated future impact

        return jsonify({
            "crater_diameter": round(crater_diameter, 2),
            "energy_release": round(energy_megatons, 2),
            "fireball_radius": round(fireball_radius, 2),
            "tsunami_height": round(tsunami_height, 2),
            "impactProbability": round(impact_probability, 4),
            "first_observation": current_time.strftime("%Y-%m-%d"),
            "predicted_impact": impact_time.strftime("%Y-%m-%d"),
            "time_until_impact": "7 days"
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
