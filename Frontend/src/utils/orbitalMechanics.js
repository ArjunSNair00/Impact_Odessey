import * as THREE from 'three';

// Physical constants
export const G = 6.67430e-11;          // Gravitational constant
export const SCALE_FACTOR = 1e9;       // Scale factor for visualization
export const AU = 149597870700;        // Astronomical Unit in meters

export class OrbitalMechanics {
  // Calculates the position of an orbiting body using Kepler's equations
  static calculateOrbitPosition(
    semiMajorAxis,    // a: orbit size
    eccentricity,     // e: shape (0=circle, 1=parabola)
    inclination,      // i: tilt angle
    ascendingNode,    // Ω: swivel angle
    argOfPeriapsis,   // ω: periapsis angle
    meanAnomaly,      // M: position in orbit
    time             // current time
  ) {
    // Calculate mean motion and current mean anomaly
    const meanMotion = Math.sqrt(1 / (semiMajorAxis * semiMajorAxis * semiMajorAxis));
    const M = meanAnomaly + meanMotion * time;

    // Solve Kepler's equation using Newton's method
    let E = M; // initial guess
    for (let i = 0; i < 10; i++) {
      const dE = (M - E + eccentricity * Math.sin(E)) / (1 - eccentricity * Math.cos(E));
      E += dE;
      if (Math.abs(dE) < 1e-8) break;
    }

    // Calculate position in orbital plane
    const x = semiMajorAxis * (Math.cos(E) - eccentricity);
    const y = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E);

    // Rotate to correct orientation
    const cosΩ = Math.cos(ascendingNode);
    const sinΩ = Math.sin(ascendingNode);
    const cosω = Math.cos(argOfPeriapsis);
    const sinω = Math.sin(argOfPeriapsis);
    const cosi = Math.cos(inclination);
    const sini = Math.sin(inclination);

    const xh = x * (cosω * cosΩ - sinω * sinΩ * cosi) - y * (sinω * cosΩ + cosω * sinΩ * cosi);
    const yh = x * (cosω * sinΩ + sinω * cosΩ * cosi) + y * (cosω * cosΩ * cosi - sinω * sinΩ);
    const zh = x * (sinω * sini) + y * (cosω * sini);

    return new THREE.Vector3(xh, yh, zh);
  }

  // Calculates gravitational force between two bodies
  static calculateGravitationalForce(pos1, mass1, pos2, mass2) {
    const r = pos2.clone().sub(pos1);
    const distance = r.length();
    const forceMagnitude = (G * mass1 * mass2) / (distance * distance);
    return r.normalize().multiplyScalar(forceMagnitude);
  }

  // Scales astronomical units to visualization units
  static scaleDistance(distance) {
    return distance / SCALE_FACTOR;
  }

  // Converts visualization units back to astronomical units
  static unscaleDistance(distance) {
    return distance * SCALE_FACTOR;
  }
}