import numpy as np
from typing import Dict, Any

class RiskCalculator:
    def __init__(self):
        # Constants for impact energy calculation
        self.rho = 3000  # kg/m³ (typical asteroid density)
        self.v_impact = 17000  # m/s (typical impact velocity)
        self.earth_radius = 6371000  # m
        self.g = 9.81  # m/s²
        self.atmospheric_density = 1.225  # kg/m³ (at sea level)
        self.heat_of_vaporization = 2.26e6  # J/kg (water)
        self.sound_speed = 343  # m/s (in air)
        
        # Impact effect thresholds
        self.thresholds = {
            'glass_breaking': 1e3,  # Pa
            'building_damage': 1e4,  # Pa
            'severe_damage': 1e5,  # Pa
            'mortality_50': 2e5,  # Pa
            'reinforced_concrete_damage': 5e5,  # Pa
        }

    def calculate_impact_energy(self, diameter: float) -> float:
        """Calculate impact energy in megatons of TNT"""
        radius = diameter / 2
        mass = (4/3) * np.pi * (radius**3) * self.rho
        energy_joules = 0.5 * mass * (self.v_impact**2)
        return energy_joules / (4.184e15)  # Convert to megatons TNT

    def calculate_impact_effects(self, energy_mt: float) -> Dict[str, Any]:
        """Calculate detailed impact effects based on impact energy"""
        energy_joules = energy_mt * 4.184e15  # Convert MT to joules
        
        # Basic impact parameters
        crater_diameter = 2 * (energy_mt ** 0.33) * 1000  # meters to km
        fireball_radius = (energy_mt ** 0.4)  # km
        destruction_radius = (energy_mt ** 0.37) * 2  # km
        
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
            "crater_diameter_km": crater_diameter,
            "fireball_radius_km": fireball_radius,
            "destruction_radius_km": destruction_radius,
            "energy_megatons": energy_mt,
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

    def calculate_torino_scale(self, energy_mt: float, impact_probability: float) -> int:
        """Calculate Torino Scale value (0-10)"""
        if impact_probability < 1e-10:
            return 0

        # Simplified Torino Scale calculation
        if energy_mt < 1:
            return 0 if impact_probability < 1e-4 else 1
        elif energy_mt < 10:
            if impact_probability < 1e-6:
                return 0
            elif impact_probability < 1e-4:
                return 1
            else:
                return 2
        elif energy_mt < 100:
            if impact_probability < 1e-6:
                return 1
            elif impact_probability < 1e-4:
                return 2
            else:
                return 3
        elif energy_mt < 1000:
            if impact_probability < 1e-6:
                return 2
            elif impact_probability < 1e-4:
                return 3
            else:
                return 4
        else:
            if impact_probability < 1e-6:
                return 3
            elif impact_probability < 1e-4:
                return 4
            else:
                return min(5 + int(np.log10(impact_probability) + 7), 10)

    def calculate_palermo_scale(self, energy_mt: float, impact_probability: float, time_till_impact_years: float) -> float:
        """Calculate Palermo Technical Impact Hazard Scale"""
        # Background annual risk of similar energy impact
        background_frequency = 0.03 * (energy_mt ** -0.8)
        
        # Calculate Palermo Scale
        ps = np.log10(impact_probability / (background_frequency * time_till_impact_years))
        return ps

    def estimate_casualties(self, impact_effects: Dict[str, Any], population_density: float = 300) -> Dict[str, Any]:
        """Estimate potential casualties based on impact effects and population density"""
        destruction_area = np.pi * (impact_effects['destruction_radius_km'] ** 2)
        severe_damage_area = np.pi * (impact_effects['blast_effects']['severe_damage_radius_km'] ** 2)
        affected_area = np.pi * (impact_effects['blast_effects']['glass_breaking_radius_km'] ** 2)
        
        return {
            "direct_casualties": int(destruction_area * population_density),
            "severe_injuries": int((severe_damage_area - destruction_area) * population_density * 0.5),
            "affected_population": int(affected_area * population_density),
            "evacuation_radius_km": max(impact_effects['destruction_radius_km'] * 1.5,
                                      impact_effects['atmospheric_effects']['fallout_radius_km'])
        }
    
    def assess_risk(self, asteroid_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive risk assessment for an asteroid"""
        diameter = asteroid_data.get('estimated_diameter_min', 10)  # meters
        # Use orbital elements to estimate probability (simplified)
        e = asteroid_data.get('orbital_elements', {}).get('eccentricity', 0)
        a = asteroid_data.get('orbital_elements', {}).get('semi_major_axis', 1)
        i = asteroid_data.get('orbital_elements', {}).get('inclination', 0)
        
        # Enhanced impact probability calculation including inclination
        base_probability = 1e-6 * (1 + abs(1 - a)) * (1 + e)
        inclination_factor = np.exp(-i / 30)  # reduces probability for high inclination orbits
        impact_probability = max(1e-10, min(1e-3, base_probability * inclination_factor))
        
        # Calculate impact energy
        energy_mt = self.calculate_impact_energy(diameter)
        
        # Calculate detailed effects
        impact_effects = self.calculate_impact_effects(energy_mt)
        
        # Estimate casualties (using global average population density)
        casualty_estimate = self.estimate_casualties(impact_effects)
        
        # Calculate risk scales
        torino = self.calculate_torino_scale(energy_mt, impact_probability)
        palermo = self.calculate_palermo_scale(energy_mt, impact_probability, 50)
        
        # Calculate risk zones
        risk_zones = {
            "immediate_danger_zone_km": impact_effects["destruction_radius_km"],
            "evacuation_zone_km": casualty_estimate["evacuation_radius_km"],
            "monitoring_zone_km": impact_effects["blast_effects"]["glass_breaking_radius_km"]
        }
        
        # Temporal risk assessment
        orbital_period = 2 * np.pi * np.sqrt((a * 1.496e8) ** 3 / (6.67e-11 * 1.989e30))
        next_approach = orbital_period / (365.25 * 24 * 3600)  # years
        
        return {
            "impact_probability": impact_probability,
            "impact_effects": impact_effects,
            "torino_scale": torino,
            "palermo_scale": palermo,
            "casualty_estimate": casualty_estimate,
            "risk_zones": risk_zones,
            "temporal_assessment": {
                "orbital_period_years": next_approach,
                "next_approach_years": next_approach,
                "observation_urgency": "HIGH" if torino >= 3 else "MEDIUM" if torino >= 1 else "LOW"
            },
            "mitigation_assessment": {
                "difficulty": "HIGH" if energy_mt > 1000 else "MEDIUM" if energy_mt > 100 else "LOW",
                "response_time_needed_years": max(2, np.log10(energy_mt)),
                "recommended_actions": [
                    "Continuous monitoring" if torino >= 1 else "Regular monitoring",
                    "Evacuation planning" if torino >= 5 else "Risk assessment",
                    "Deflection mission planning" if torino >= 7 else "Technology preparation"
                ]
            }
        }