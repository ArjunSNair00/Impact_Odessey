import numpy as np
from scipy.integrate import odeint
from datetime import datetime, timedelta

class OrbitalCalculator:
    """
    Advanced orbital calculations and predictions for asteroids
    """
    # Gravitational constant (km³/kg/s²)
    G = 6.67430e-20
    # Sun's mass (kg)
    M_SUN = 1.989e30
    # Earth's mass (kg)
    M_EARTH = 5.972e24
    # Astronomical Unit in kilometers
    AU = 149597870.7

    @staticmethod
    def orbital_elements_to_state_vectors(elements):
        """Convert orbital elements to state vectors (position and velocity)"""
        a = elements['semi_major_axis'] * OrbitalCalculator.AU
        e = elements['eccentricity']
        i = np.radians(elements['inclination'])
        Ω = np.radians(elements['ascending_node_longitude'])
        ω = np.radians(elements['perihelion_argument'])
        
        # Calculate position in orbital plane
        p = a * (1 - e*e)
        r = p / (1 + e * np.cos(0))  # True anomaly = 0 for initial position
        
        # Position in orbital plane
        x = r * np.cos(0)
        y = r * np.sin(0)
        z = 0

        # Velocity components in orbital plane
        h = np.sqrt(OrbitalCalculator.G * OrbitalCalculator.M_SUN * p)
        v_x = -(h/r) * np.sin(0)
        v_y = (h/r) * (e + np.cos(0))
        v_z = 0

        # Rotation matrices
        R_ω = np.array([
            [np.cos(ω), -np.sin(ω), 0],
            [np.sin(ω), np.cos(ω), 0],
            [0, 0, 1]
        ])
        
        R_i = np.array([
            [1, 0, 0],
            [0, np.cos(i), -np.sin(i)],
            [0, np.sin(i), np.cos(i)]
        ])
        
        R_Ω = np.array([
            [np.cos(Ω), -np.sin(Ω), 0],
            [np.sin(Ω), np.cos(Ω), 0],
            [0, 0, 1]
        ])

        # Transform to reference plane
        pos = R_Ω @ R_i @ R_ω @ np.array([x, y, z])
        vel = R_Ω @ R_i @ R_ω @ np.array([v_x, v_y, v_z])

        return np.concatenate([pos, vel])

    @staticmethod
    def propagate_orbit(state, t, μ=G*M_SUN):
        """Propagate orbital state using n-body equations"""
        r = state[:3]
        v = state[3:]
        r_mag = np.linalg.norm(r)
        
        # Basic two-body acceleration
        a = -μ * r / (r_mag**3)
        
        # Add perturbations (simplified)
        # Solar radiation pressure
        P_sr = 4.56e-6  # Solar radiation pressure at 1 AU (N/m²)
        a_sr = -P_sr * (r / r_mag) * (OrbitalCalculator.AU / r_mag)**2
        
        # Combine accelerations
        a_total = a + a_sr
        
        return np.concatenate([v, a_total])

    def predict_trajectory(self, elements, times):
        """Predict asteroid trajectory over given time points"""
        initial_state = self.orbital_elements_to_state_vectors(elements)
        
        # Integrate orbit
        solution = odeint(self.propagate_orbit, initial_state, times)
        
        # Extract positions
        positions = solution[:, :3]
        velocities = solution[:, 3:]
        
        return positions, velocities

    def calculate_moid(self, asteroid_elements):
        """Calculate Minimum Orbit Intersection Distance (MOID) with Earth"""
        # Simplified MOID calculation
        a = asteroid_elements['semi_major_axis']
        e = asteroid_elements['eccentricity']
        i = asteroid_elements['inclination']
        
        # Basic MOID approximation
        q = a * (1 - e)  # perihelion distance
        Q = a * (1 + e)  # aphelion distance
        
        if q > 1.017 or Q < 0.983:
            return min(abs(q - 1), abs(Q - 1))
        else:
            # Rough approximation when orbits can intersect
            return abs(np.sin(np.radians(i))) * min(abs(q - 1), abs(Q - 1))

    def assess_impact_risk(self, asteroid_data):
        """Assess impact risk based on orbital parameters and physical properties"""
        moid = self.calculate_moid(asteroid_data['orbital_elements'])
        
        # Basic risk assessment factors
        risk_factors = {
            'moid': moid,
            'velocity': asteroid_data.get('relative_velocity_kps', 0),
            'size': (asteroid_data.get('diameter_min', 0) + asteroid_data.get('diameter_max', 0)) / 2,
            'impact_probability': self._calculate_impact_probability(moid)
        }
        
        # Calculate Palermo Scale (simplified)
        impact_energy = self._calculate_impact_energy(risk_factors['size'], risk_factors['velocity'])
        background_risk = 1e-8  # Annual background risk
        time_factor = 1  # Simplified time factor
        
        palermo_scale = np.log10((risk_factors['impact_probability'] * impact_energy) / 
                                (background_risk * time_factor))
        
        risk_factors['palermo_scale'] = palermo_scale
        risk_factors['torino_scale'] = self._calculate_torino_scale(palermo_scale, risk_factors['impact_probability'])
        
        return risk_factors

    def _calculate_impact_probability(self, moid):
        """Calculate approximate impact probability based on MOID"""
        if moid > 0.1:
            return 0
        return np.exp(-moid * 50)  # Simplified probability model

    def _calculate_impact_energy(self, diameter, velocity):
        """Calculate impact energy in megatons TNT"""
        density = 3000  # kg/m³ (assumed average asteroid density)
        mass = (4/3) * np.pi * (diameter/2)**3 * density
        energy = 0.5 * mass * (velocity * 1000)**2  # Convert velocity to m/s
        return energy / 4.184e15  # Convert to megatons TNT

    def _calculate_torino_scale(self, palermo_scale, impact_probability):
        """Calculate Torino Scale value (0-10)"""
        if impact_probability < 1e-10:
            return 0
        elif palermo_scale < -2:
            return 0
        elif palermo_scale < 0:
            return 1
        elif palermo_scale < 2:
            return min(4, int(palermo_scale + 2))
        else:
            return min(10, int(palermo_scale + 3))