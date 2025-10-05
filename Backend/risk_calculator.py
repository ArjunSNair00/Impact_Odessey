import numpy as np
from typing import Dict, Any

class RiskCalculator:
    def __init__(self):
        # Constants for impact energy calculation
        self.earth_radius = 6371000  # m
        self.g = 9.81  # m/s
        self.atmospheric_density = 1.225  # kg/m (at sea level)
        self.heat_of_vaporization = 2.26e6  # J/kg (water)
        self.sound_speed = 343  # m/s (in air)
        
        # Impact effect thresholds
        self.thresholds = {
            "glass_breaking": 1e3,  # Pa
            "building_damage": 1e4,  # Pa
            "severe_damage": 1e5,  # Pa
            "mortality_50": 2e5,  # Pa
            "reinforced_concrete_damage": 5e5,  # Pa
        }

    def calculate_impact_energy(self, asteroid_data: Dict[str, Any]) -> float:
        """Calculate impact energy in megatons of TNT"""
        diameter = asteroid_data.get("estimated_diameter_min", 10)  # meters
        mass = asteroid_data.get("estimated_mass")  # kg
        density = asteroid_data.get("density", 3000)  # kg/m
        
        if not mass:
            # Calculate mass from diameter and density if not provided
            radius = diameter / 2
            mass = (4/3) * np.pi * (radius**3) * density
        
        # Get velocity from close approach data
        velocity = 17000  # default m/s
        if "close_approach_data" in asteroid_data and asteroid_data["close_approach_data"]:
            v_kms = float(asteroid_data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"])
            velocity = v_kms * 1000  # convert to m/s
            
        energy_joules = 0.5 * mass * (velocity**2)
        return energy_joules / (4.184e15)  # Convert to megatons TNT

    def calculate_impact_effects(self, energy_mt: float) -> Dict[str, Any]:
        """Calculate detailed impact effects based on impact energy"""
        energy_joules = energy_mt * 4.184e15  # Convert MT to joules
        
        # Basic impact parameters
        crater_diameter = 2 * (energy_mt ** 0.33)  # km
        fireball_radius = (energy_mt ** 0.4)  # km
        destruction_radius = (energy_mt ** 0.37) * 2  # km
        
        # Detailed crater formation
        transient_crater_depth = crater_diameter * 0.28  # km
        final_crater_depth = transient_crater_depth * 0.7  # km
        ejecta_blanket_radius = crater_diameter * 1.5  # km
        
        # Blast wave calculations
        overpressure_1psi = 4.4 * (energy_mt ** 0.33)  # km
        overpressure_20psi = 1.1 * (energy_mt ** 0.33)  # km
        
        # Thermal radiation effects
        thermal_radius = 1.2 * (energy_mt ** 0.4)  # km
        
        # Seismic effects
        richter_scale = 0.67 * (np.log10(energy_joules) - 4.8)
        
        # Atmospheric effects
        airburst_altitude = 8 * np.log10(energy_mt + 1)  # km
        fallout_radius = destruction_radius * 1.5  # km

        return {
            "energy_megatons": energy_mt,  # Add energy field
            "crater_diameter_km": crater_diameter,
            "crater_depth_km": final_crater_depth,
            "fireball_radius_km": fireball_radius,
            "destruction_radius_km": destruction_radius,
            "ejecta_blanket_radius_km": ejecta_blanket_radius,
            "blast_effects": {
                "glass_breaking_radius_km": overpressure_1psi * 1.2,
                "building_damage_radius_km": overpressure_1psi,
                "severe_damage_radius_km": overpressure_20psi
            },
            "thermal_effects": {
                "radius_km": thermal_radius,
                "third_degree_burns_radius_km": thermal_radius * 0.7
            },
            "seismic_effects": {
                "richter_scale": richter_scale,
                "felt_radius_km": 10 ** (0.5 * richter_scale)
            },
            "atmospheric_effects": {
                "airburst_altitude_km": airburst_altitude,
                "fallout_radius_km": fallout_radius,
                "global_effects": energy_mt > 1000
            },
            "long_term_effects": {
                "climate_effects": energy_mt > 10000,
                "mass_extinction_risk": energy_mt > 100000,
                "dust_settling_days": int(10 * np.log10(energy_mt + 1))
            }
        }

    def calculate_palermo_scale(self, impact_probability: float, energy_mt: float, time_years: float = 50) -> float:
        """Calculate Palermo Technical Impact Hazard Scale"""
        # Background impact rate (impacts per year for this energy)
        # Based on NEO population statistics
        background_rate = 0.03 * (energy_mt ** -0.8)
        
        # Risk relative to background
        if background_rate > 0 and time_years > 0:
            palermo = np.log10(impact_probability / (background_rate * time_years))
        else:
            palermo = -10.0  # Very low risk
            
        return palermo

    def assess_risk(self, asteroid_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk assessment for an asteroid"""
        # Calculate impact energy
        energy_mt = self.calculate_impact_energy(asteroid_data)
        
        # Calculate impact effects
        impact_effects = self.calculate_impact_effects(energy_mt)
        
        # Calculate impact probability based on parameters
        diameter = asteroid_data.get("estimated_diameter_min", 10)
        velocity = 17000  # m/s default
        if "close_approach_data" in asteroid_data and asteroid_data["close_approach_data"]:
            v_kms = float(asteroid_data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"])
            velocity = v_kms * 1000
            
        # Base probability calculation (simplified)
        base_probability = 1e-6
        if diameter > 100:
            base_probability *= diameter / 100
        if velocity > 20000:
            base_probability *= velocity / 20000
            
        # Adjust for composition
        density = asteroid_data.get("density", 3000)
        if density > 5000:  # Iron-rich
            base_probability *= 1.2
        elif density < 2000:  # Ice-rich
            base_probability *= 0.8
            
        # Calculate Palermo scale
        palermo_scale = self.calculate_palermo_scale(base_probability, energy_mt)
        
        # Calculate risk zones
        risk_zones = {
            "immediate_destruction": {
                "radius_km": impact_effects["destruction_radius_km"],
                "description": "Complete devastation, no survival likely",
                "severity": "Extreme"
            },
            "severe_damage": {
                "radius_km": impact_effects["blast_effects"]["severe_damage_radius_km"],
                "description": "Severe structural damage, high casualty rate",
                "severity": "High"
            },
            "moderate_damage": {
                "radius_km": impact_effects["blast_effects"]["building_damage_radius_km"],
                "description": "Significant building damage, moderate casualties",
                "severity": "Moderate"
            },
            "light_damage": {
                "radius_km": impact_effects["blast_effects"]["glass_breaking_radius_km"],
                "description": "Window breakage, minor injuries possible",
                "severity": "Light"
            }
        }
        
        # Calculate casualty estimates (assuming average population density)
        population_density = 300  # people per km
        casualty_estimate = self.estimate_casualties(impact_effects, population_density)
        
        # Calculate threat level
        torino_scale = 0
        if energy_mt > 10000:
            torino_scale = 10
        elif energy_mt > 1000:
            torino_scale = 8
        elif energy_mt > 100:
            torino_scale = 6
        elif energy_mt > 10:
            torino_scale = 4
        elif energy_mt > 1:
            torino_scale = 2
            
        return {
            "impact_probability": base_probability,
            "torino_scale": torino_scale,
            "palermo_scale": palermo_scale,
            "threat_level": "Severe" if torino_scale >= 8 else "High" if torino_scale >= 5 else "Moderate" if torino_scale >= 2 else "Low",
            "impact_effects": impact_effects,
            "risk_zones": risk_zones,
            "casualty_estimate": casualty_estimate
        }

    def estimate_casualties(self, impact_effects: Dict[str, Any], population_density: float = 300) -> Dict[str, Any]:
        """Estimate potential casualties based on impact effects and population density"""
        destruction_area = np.pi * (impact_effects["destruction_radius_km"] ** 2)
        severe_damage_area = np.pi * (impact_effects["blast_effects"]["severe_damage_radius_km"] ** 2)
        affected_area = np.pi * (impact_effects["blast_effects"]["glass_breaking_radius_km"] ** 2)
        
        return {
            "direct_casualties": int(destruction_area * population_density),
            "severe_injuries": int((severe_damage_area - destruction_area) * population_density * 0.5),
            "affected_population": int(affected_area * population_density),
            "evacuation_radius_km": impact_effects["destruction_radius_km"] * 1.5
        }