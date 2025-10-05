import os
import logging
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
from risk_calculator import RiskCalculator
from config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize risk calculator
risk_calc = RiskCalculator()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Asteroid Impact Prediction API",
        "endpoints": {
            "/api/predict-impact": "Calculate impact predictions for an asteroid",
            "/api/asteroids": "Get real asteroid data from NASA's NEO API",
            "/api/asteroid/<id>": "Get details for a specific asteroid"
        }
    })

@app.route('/api/asteroid/<asteroid_id>', methods=['GET'])
def get_asteroid_detail(asteroid_id):
    """Get detailed information for a specific asteroid by ID."""
    try:
        # Construct URL for asteroid detail endpoint
        detail_url = f"{Config.NEO_API_BASE_URL}/neo/{asteroid_id}"
        detail_params = {'api_key': Config.NASA_API_KEY}
        
        logger.info(f"Fetching details for asteroid {asteroid_id}")
        
        try:
            detail_response = requests.get(detail_url, params=detail_params, timeout=10)
            logger.info(f"Detail API Response Status: {detail_response.status_code}")
            
            if not detail_response.ok:
                logger.error(f"NASA API error: Status {detail_response.status_code}, Response: {detail_response.text}")
                return jsonify({
                    'success': False,
                    'error': f'NASA API error: {detail_response.status_code}'
                }), detail_response.status_code
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Detail request failed for asteroid {asteroid_id}: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Failed to fetch asteroid details from NASA API'
            }), 500
            
        detail_data = detail_response.json()
        
        # Prepare base asteroid data
        asteroid_data = {
            'id': detail_data['id'],
            'name': detail_data['name'],
            'diameter': float(detail_data['estimated_diameter']['kilometers']['estimated_diameter_max']),
            'is_potentially_hazardous': detail_data['is_potentially_hazardous_asteroid'],
        }
        
        # Add orbital data if available
        if 'orbital_data' in detail_data:
            od = detail_data['orbital_data']
            try:
                # Get orbit class data
                orbit_class = od.get('orbit_class', {})
                if not isinstance(orbit_class, dict):
                    orbit_class = {}
                
                # Map orbit class fields correctly
                orbit_class_data = {
                    'orbit_class_type': orbit_class.get('orbit_class_type'),
                    'orbit_class_description': orbit_class.get('orbit_class_description'),
                    'orbit_class_range': orbit_class.get('orbit_class_range')
                }
                    
                asteroid_data['orbit'] = {
                    'eccentricity': _safe_float(od.get('eccentricity')),
                    'semi_major_axis': _safe_float(od.get('semi_major_axis')),
                    'inclination': _safe_float(od.get('inclination')),
                    'ascending_node': _safe_float(od.get('ascending_node_longitude')),
                    'perihelion_argument': _safe_float(od.get('perihelion_argument')),
                    'mean_anomaly': _safe_float(od.get('mean_anomaly')),
                    'epoch_osculation': od.get('epoch_osculation'),
                    'perihelion_distance': _safe_float(od.get('perihelion_distance')),
                    'aphelion_distance': _safe_float(od.get('aphelion_distance')),
                    'orbital_period': _safe_float(od.get('orbital_period')),
                    'perihelion_time': _safe_float(od.get('perihelion_time')),
                    'mean_motion': _safe_float(od.get('mean_motion')),
                    'orbit_uncertainty': od.get('orbit_uncertainty'),
                    'minimum_orbit_intersection': _safe_float(od.get('minimum_orbit_intersection')),
                    'jupiter_tisserand_invariant': _safe_float(od.get('jupiter_tisserand_invariant')),
                    'epoch_close_approach': od.get('epoch_close_approach'),
                    'orbit_determination_date': od.get('orbit_determination_date'),
                    'observations_used': _safe_float(od.get('observations_used')),
                    'data_arc_in_days': _safe_float(od.get('data_arc_in_days')),
                    'orbit_class_type': orbit_class_data['orbit_class_type'],
                    'orbit_class_description': orbit_class_data['orbit_class_description'],
                    'orbit_class_range': orbit_class_data['orbit_class_range']
                }
            except (ValueError, TypeError, AttributeError):
                asteroid_data['orbit'] = {}
        else:
            # Don't fabricate orbital elements; return empty orbit so UI shows N/A
            asteroid_data['orbit'] = {}
            
        # Add close approach data if available
        if 'close_approach_data' in detail_data:
            asteroid_data['close_approaches'] = []
            for approach in detail_data['close_approach_data']:
                try:
                    approach_data = {
                        'close_approach_date': approach['close_approach_date'],
                        'velocity': float(approach['relative_velocity']['kilometers_per_second']),
                        'miss_distance': float(approach['miss_distance']['kilometers']),
                        'orbiting_body': approach['orbiting_body']
                    }
                    asteroid_data['close_approaches'].append(approach_data)
                except (KeyError, ValueError, TypeError):
                    continue
                    
        return jsonify({
            'success': True,
            'asteroid': asteroid_data
        })
    
    except Exception as e:
        logger.error(f"Error processing asteroid detail: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process asteroid details'
        }), 500

@app.route('/api/asteroids', methods=['GET'])
def get_asteroids():
    try:
        # Get query parameters
        fetch_details = request.args.get('details', 'false').lower() == 'true'
        
        # Calculate date range (today and next 7 days)
        start_date = datetime.now().strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Make request to NASA's NEO API with reduced date range
        url = "https://api.nasa.gov/neo/rest/v1/feed"
        params = {
            'start_date': start_date,
            'end_date': start_date,  # Only fetch today's asteroids for faster response
            'api_key': Config.NASA_API_KEY
        }
        
        logger.info(f"Fetching asteroid data from NASA API for date range: {start_date} to {end_date}")
        logger.info(f"Using API URL: {url}")
        
        try:
            response = requests.get(url, params=params, timeout=10)  # Add timeout
            logger.info(f"NASA API Response Status: {response.status_code}")
            if not response.ok:
                logger.error(f"Response text: {response.text}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            raise
        
        if not response.ok:
            logger.error(f"NASA API error: Status {response.status_code}, Response: {response.text}")
            return jsonify({
                'success': False,
                'error': f'NASA API error: {response.status_code}'
            }), response.status_code
        
        data = response.json()
        if 'near_earth_objects' not in data:
            logger.error(f"Unexpected NASA API response format: {data}")
            return jsonify({
                'success': False,
                'error': 'Invalid response format from NASA API'
            }), 500
            
        asteroids = []
        
        # Limit to first 5 asteroids for faster initial load
        total_asteroids = 0
        for date in data['near_earth_objects']:
            for asteroid in data['near_earth_objects'][date]:
                total_asteroids += 1
                if total_asteroids > 5:  # Only process first 5 asteroids
                    break
                try:
                    # Basic asteroid data available in feed
                    detail_data = asteroid
                    
                    # Optionally fetch full details if requested
                    if fetch_details:
                        detail_url = f"{Config.NEO_API_BASE_URL}/neo/{asteroid['id']}"
                        detail_params = {'api_key': Config.NASA_API_KEY}
                        logger.info(f"Fetching details for asteroid {asteroid['id']}")
                        
                        try:
                            detail_response = requests.get(detail_url, params=detail_params, timeout=10)
                            logger.info(f"Detail API Response Status: {detail_response.status_code}")
                            
                            if detail_response.ok:
                                detail_data = detail_response.json()
                            else:
                                logger.warning(f"Failed to fetch details for asteroid {asteroid['id']}: {detail_response.status_code}")
                        except requests.exceptions.RequestException as e:
                            logger.error(f"Detail request failed for asteroid {asteroid['id']}: {str(e)}")
                    
                    asteroid_data = {
                        'id': detail_data['id'],
                        'name': detail_data['name'],
                        'diameter': float(detail_data['estimated_diameter']['kilometers']['estimated_diameter_max']),
                        'velocity': float(asteroid['close_approach_data'][0]['relative_velocity']['kilometers_per_second']),
                        'miss_distance': float(asteroid['close_approach_data'][0]['miss_distance']['kilometers']),
                        'is_potentially_hazardous': detail_data['is_potentially_hazardous_asteroid'],
                        'close_approach_date': asteroid['close_approach_data'][0]['close_approach_date']
                    }
                    
                    if 'orbital_data' in detail_data:
                        # Use available orbital elements from detail endpoint
                        od = detail_data['orbital_data']
                        try:
                            # Get orbit class data
                            orbit_class = od.get('orbit_class', {})
                            if not isinstance(orbit_class, dict):
                                orbit_class = {}
                            
                            # Map orbit class fields correctly
                            orbit_class_data = {
                                'orbit_class_type': orbit_class.get('orbit_class_type'),
                                'orbit_class_description': orbit_class.get('orbit_class_description'),
                                'orbit_class_range': orbit_class.get('orbit_class_range')
                            }
                                
                            asteroid_data['orbit'] = {
                                'eccentricity': _safe_float(od.get('eccentricity')),
                                'semi_major_axis': _safe_float(od.get('semi_major_axis')),
                                'inclination': _safe_float(od.get('inclination')),
                                'ascending_node': _safe_float(od.get('ascending_node_longitude')),
                                'perihelion_argument': _safe_float(od.get('perihelion_argument')),
                                'mean_anomaly': _safe_float(od.get('mean_anomaly')),
                                'epoch_osculation': od.get('epoch_osculation'),
                                'perihelion_distance': _safe_float(od.get('perihelion_distance')),
                                'aphelion_distance': _safe_float(od.get('aphelion_distance')),
                                'orbital_period': _safe_float(od.get('orbital_period')),
                                'perihelion_time': _safe_float(od.get('perihelion_time')),
                                'mean_motion': _safe_float(od.get('mean_motion')),
                                'orbit_uncertainty': od.get('orbit_uncertainty'),
                                'minimum_orbit_intersection': _safe_float(od.get('minimum_orbit_intersection')),
                                'jupiter_tisserand_invariant': _safe_float(od.get('jupiter_tisserand_invariant')),
                                'epoch_close_approach': od.get('epoch_close_approach'),
                                'orbit_determination_date': od.get('orbit_determination_date'),
                                'observations_used': _safe_float(od.get('observations_used')),
                                'data_arc_in_days': _safe_float(od.get('data_arc_in_days')),
                                'orbit_class_type': orbit_class_data['orbit_class_type'],
                                'orbit_class_description': orbit_class_data['orbit_class_description'],
                                'orbit_class_range': orbit_class_data['orbit_class_range']
                            }
                        except (ValueError, TypeError, AttributeError):
                            asteroid_data['orbit'] = {}
                    else:
                        # Don't fabricate orbital elements; return empty orbit so UI shows N/A
                        asteroid_data['orbit'] = {}
                        
                    asteroids.append(asteroid_data)
                except (KeyError, ValueError, IndexError) as e:
                    logger.warning(f"Skipping asteroid due to missing or invalid data: {str(e)}")
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'asteroids': asteroids
        })
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching asteroid data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch asteroid data from NASA API'
        }), 500


@app.route('/api/impact-summary', methods=['GET'])
def impact_summary():
    """Fetch asteroids from NASA and produce risk summaries and Plotly-ready data."""
    try:
        # Reuse the same date range as /api/asteroids
        start_date = datetime.now().strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

        url = "https://api.nasa.gov/neo/rest/v1/feed"
        params = {
            'start_date': start_date,
            'end_date': end_date,
            'api_key': Config.NASA_API_KEY
        }

        logger.info(f"Fetching asteroid data for impact summary: {start_date} to {end_date}")
        response = requests.get(url, params=params)
        if not response.ok:
            logger.error(f"NASA API error for impact summary: {response.status_code}")
            return jsonify({'success': False, 'error': 'NASA API error'}), 502

        data = response.json()
        if 'near_earth_objects' not in data:
            return jsonify({'success': False, 'error': 'Invalid NASA response format'}), 500

        # Flatten and assess risk for each asteroid
        hazardous = []
        all_assessments = []

        for date in data['near_earth_objects']:
            for neo in data['near_earth_objects'][date]:
                try:
                    asteroid_payload = {
                        'id': neo.get('id'),
                        'name': neo.get('name'),
                        'estimated_diameter_min': neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_min'),
                        'estimated_diameter_max': neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_max'),
                        'is_potentially_hazardous_asteroid': neo.get('is_potentially_hazardous_asteroid', False),
                        'close_approach_date': neo.get('close_approach_data', [{}])[0].get('close_approach_date') if neo.get('close_approach_data') else None,
                        'orbital_elements': {
                            'eccentricity': _safe_float(neo.get('orbital_data', {}).get('eccentricity')),
                            'semi_major_axis': _safe_float(neo.get('orbital_data', {}).get('semi_major_axis')),
                            'inclination': _safe_float(neo.get('orbital_data', {}).get('inclination'))
                        }
                    }

                    assessment = risk_calc.assess_risk(asteroid_payload)
                    assessment_summary = {
                        'id': asteroid_payload['id'],
                        'name': asteroid_payload['name'],
                        'impact_probability': assessment.get('impact_probability', 0),
                        'energy_megatons': assessment.get('impact_effects', {}).get('energy_megatons', 0),
                        'torino_scale': assessment.get('torino_scale', 0),
                        'palermo_scale': assessment.get('palermo_scale', 0),
                        'risk_zones': assessment.get('risk_zones', {}),
                    }

                    all_assessments.append(assessment_summary)

                    if asteroid_payload['is_potentially_hazardous_asteroid'] or assessment_summary['impact_probability'] > 1e-6:
                        hazardous.append(assessment_summary)

                except Exception as e:
                    logger.warning(f"Skipping NEO during assessment: {str(e)}")

        # Sort hazardous by descending probability
        hazardous_sorted = sorted(hazardous, key=lambda x: x['impact_probability'], reverse=True)

        # Prepare Plotly-ready payload: bar chart of hazardous asteroids (name vs impact_probability)
        plot_data = {
            'data': [
                {
                    'type': 'bar',
                    'x': [h['name'] for h in hazardous_sorted],
                    'y': [h['impact_probability'] for h in hazardous_sorted],
                    'marker': {'color': 'crimson'}
                }
            ],
            'layout': {
                'title': 'Hazardous Asteroids: Impact Probability',
                'xaxis': {'title': 'Asteroid'},
                'yaxis': {'title': 'Impact Probability (absolute)'}
            }
        }

        # highest probability
        highest_prob = max([a['impact_probability'] for a in all_assessments], default=0)

        return jsonify({
            'success': True,
            'count': len(all_assessments),
            'hazardous': hazardous_sorted,
            'plotly': plot_data,
            'highest_probability': highest_prob
        })

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching NASA data for impact summary: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to fetch NASA data'}), 500


def _safe_float(val):
    try:
        if val is None:
            return None
        return float(val)
    except (ValueError, TypeError):
        return None

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)