from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import numpy as np
from orbital_calculator import OrbitalCalculator
from risk_calculator import RiskCalculator

app = Flask(__name__)
CORS(app)

# NASA API configuration
NASA_API_KEY = "XGBZi6AiSb50YI6Fp03N6IQj3avZ7V6AbHauM03I"
BASE_URL = "https://api.nasa.gov/neo/rest/v1"

# Initialize calculators
calculator = OrbitalCalculator()
risk_calculator = RiskCalculator()

# NASA API configuration
NASA_API_KEY = "XGBZi6AiSb50YI6Fp03N6IQj3avZ7V6AbHauM03I"  # Replace with your NASA API key
BASE_URL = "https://api.nasa.gov/neo/rest/v1"

def fetch_neo_data(start_date=None, end_date=None):
    """
    Fetch Near Earth Object data from NASA API
    If no dates provided, fetches data for next 7 days
    """
    if not start_date:
        start_date = datetime.now().strftime("%Y-%m-%d")
    if not end_date:
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    
    url = f"{BASE_URL}/feed"
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "api_key": NASA_API_KEY
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching NEO data: {e}")
        return None

def extract_orbital_elements(neo_data):
    """
    Extract relevant orbital elements and asteroid information from NEO data
    """
    asteroids = []
    if not neo_data or "near_earth_objects" not in neo_data:
        return asteroids

    for date in neo_data["near_earth_objects"]:
        for asteroid in neo_data["near_earth_objects"][date]:
            orbital_data = asteroid.get("orbital_data", {})
            
            asteroid_info = {
                "id": asteroid["id"],
                "name": asteroid["name"],
                "diameter_min": asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_min"],
                "diameter_max": asteroid["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
                "is_potentially_hazardous": asteroid["is_potentially_hazardous_asteroid"],
                "close_approach_date": asteroid["close_approach_data"][0]["close_approach_date"] if asteroid["close_approach_data"] else None,
                "miss_distance_kilometers": float(asteroid["close_approach_data"][0]["miss_distance"]["kilometers"]) if asteroid["close_approach_data"] else None,
                "relative_velocity_kps": float(asteroid["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"]) if asteroid["close_approach_data"] else None,
                "orbital_elements": {
                    "semi_major_axis": float(orbital_data.get("semi_major_axis", 0)),
                    "eccentricity": float(orbital_data.get("eccentricity", 0)),
                    "inclination": float(orbital_data.get("inclination", 0)),
                    "ascending_node_longitude": float(orbital_data.get("ascending_node_longitude", 0)),
                    "orbital_period": float(orbital_data.get("orbital_period", 0)),
                    "perihelion_distance": float(orbital_data.get("perihelion_distance", 0)),
                    "aphelion_distance": float(orbital_data.get("aphelion_distance", 0))
                }
            }
            asteroids.append(asteroid_info)
    
    return asteroids

@app.route('/api/asteroids', methods=['GET'])
def get_asteroids():
    """
    Endpoint to get asteroid data including orbital elements
    """
    neo_data = fetch_neo_data()
    if not neo_data:
        return jsonify({"error": "Failed to fetch asteroid data"}), 500
    
    asteroids = extract_orbital_elements(neo_data)
    
    # Add risk assessment for each asteroid
    for asteroid in asteroids:
        processed_data = {
            'estimated_diameter_min': asteroid['diameter_min'] * 1000,  # convert to meters
            'orbital_elements': asteroid['orbital_elements']
        }
        asteroid['risk_assessment'] = risk_calculator.assess_risk(processed_data)
    
    # Sort asteroids by risk (Torino scale and miss distance)
    sorted_asteroids = sorted(asteroids, 
                            key=lambda x: (x['risk_assessment']['torino_scale'] * 1000 + 
                                         (1/x['miss_distance_kilometers'] if x['miss_distance_kilometers'] else 0)))[:100]
    return jsonify({
        "count": len(sorted_asteroids),
        "asteroids": sorted_asteroids
    })

@app.route('/api/risk/<asteroid_id>')
def get_risk_assessment(asteroid_id):
    """Get risk assessment for a specific asteroid"""
    neo_data = fetch_neo_data()
    if not neo_data:
        return jsonify({"error": "Failed to fetch asteroid data"}), 500

    # Find the asteroid in the data
    asteroids = extract_orbital_elements(neo_data)
    asteroid = next((a for a in asteroids if a['id'] == asteroid_id), None)
    
    if not asteroid:
        return jsonify({"error": "Asteroid not found"}), 404

    # Process asteroid data for risk assessment
    processed_data = {
        'estimated_diameter_min': asteroid['diameter_min'] * 1000,  # convert to meters
        'orbital_elements': asteroid['orbital_elements']
    }

    # Calculate risk assessment
    risk_assessment = risk_calculator.assess_risk(processed_data)

    return jsonify({
        "asteroid_id": asteroid_id,
        "risk_assessment": risk_assessment
    }
    })

@app.route('/api/hazardous-asteroids', methods=['GET'])
def get_hazardous_asteroids():
    """
    Endpoint to get only potentially hazardous asteroids
    """
    neo_data = fetch_neo_data()
    if not neo_data:
        return jsonify({"error": "Failed to fetch asteroid data"}), 500
    
    asteroids = extract_orbital_elements(neo_data)
    hazardous_asteroids = [ast for ast in asteroids if ast["is_potentially_hazardous"]]
    
    return jsonify({
        "count": len(hazardous_asteroids),
        "asteroids": hazardous_asteroids
    })

@app.route('/api/asteroid/<asteroid_id>/trajectory', methods=['GET'])
def get_asteroid_trajectory(asteroid_id):
    """Calculate and return predicted trajectory for a specific asteroid"""
    days = int(request.args.get('days', 365))
    
    # Fetch asteroid data
    url = f"{BASE_URL}/neo/{asteroid_id}"
    try:
        response = requests.get(url, params={"api_key": NASA_API_KEY})
        response.raise_for_status()
        asteroid_data = response.json()
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to fetch asteroid data: {e}"}), 500

    # Extract orbital elements
    orbital_data = asteroid_data.get("orbital_data", {})
    elements = {
        "semi_major_axis": float(orbital_data.get("semi_major_axis", 0)),
        "eccentricity": float(orbital_data.get("eccentricity", 0)),
        "inclination": float(orbital_data.get("inclination", 0)),
        "ascending_node_longitude": float(orbital_data.get("ascending_node_longitude", 0)),
        "perihelion_argument": float(orbital_data.get("perihelion_argument", 0))
    }

    # Calculate trajectory
    times = np.linspace(0, days * 86400, num=1000)  # Convert days to seconds
    positions, velocities = calculator.predict_trajectory(elements, times)

    # Format response
    trajectory_data = [{
        "time": times[i] / 86400,  # Convert back to days
        "position": positions[i].tolist(),
        "velocity": velocities[i].tolist()
    } for i in range(len(times))]

    return jsonify({
        "asteroid_id": asteroid_id,
        "trajectory": trajectory_data
    })

@app.route('/api/asteroid/<asteroid_id>/risk-assessment', methods=['GET'])
def get_asteroid_risk_assessment(asteroid_id):
    """Get detailed risk assessment for a specific asteroid"""
    # Fetch asteroid data
    url = f"{BASE_URL}/neo/{asteroid_id}"
    try:
        response = requests.get(url, params={"api_key": NASA_API_KEY})
        response.raise_for_status()
        asteroid_data = response.json()
    except requests.RequestException as e:
        return jsonify({"error": f"Failed to fetch asteroid data: {e}"}), 500

    # Extract relevant data
    orbital_data = asteroid_data.get("orbital_data", {})
    close_approach_data = asteroid_data.get("close_approach_data", [{}])[0]
    
    asteroid_info = {
        "id": asteroid_data["id"],
        "name": asteroid_data["name"],
        "diameter_min": asteroid_data["estimated_diameter"]["kilometers"]["estimated_diameter_min"],
        "diameter_max": asteroid_data["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
        "orbital_elements": {
            "semi_major_axis": float(orbital_data.get("semi_major_axis", 0)),
            "eccentricity": float(orbital_data.get("eccentricity", 0)),
            "inclination": float(orbital_data.get("inclination", 0)),
            "ascending_node_longitude": float(orbital_data.get("ascending_node_longitude", 0)),
            "perihelion_argument": float(orbital_data.get("perihelion_argument", 0))
        }
    }

    # Calculate risk assessment
    risk_assessment = calculator.assess_impact_risk(asteroid_info)
    
    # Add additional impact scenario details
    if risk_assessment['impact_probability'] > 0:
        energy_megatons = calculator._calculate_impact_energy(
            (asteroid_info['diameter_min'] + asteroid_info['diameter_max']) / 2,
            float(close_approach_data.get("relative_velocity", {}).get("kilometers_per_second", 0))
        )
        
        # Calculate impact effects (simplified)
        crater_diameter = 20 * ((asteroid_info['diameter_min'] + asteroid_info['diameter_max']) / 2) ** 0.5
        fireball_radius = 1.5 * energy_megatons ** (1/3)
        
        risk_assessment['impact_effects'] = {
            'energy_megatons': energy_megatons,
            'crater_diameter_km': crater_diameter,
            'fireball_radius_km': fireball_radius,
            'destruction_radius_km': fireball_radius * 2
        }

    return jsonify({
        "asteroid_id": asteroid_id,
        "risk_assessment": risk_assessment
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
