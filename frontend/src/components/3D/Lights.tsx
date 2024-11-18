import React, { useMemo } from 'react'
import * as THREE from 'three'

interface LightsProps {
    isDarkMode?: boolean
    modelSize?: { x: number, y: number, z: number }
}

export const Lights: React.FC<LightsProps> = ({ 
    isDarkMode = false, 
    modelSize = { x: 1, y: 1, z: 1 } 
}) => {
    // Adaptive light parameters based on model size
    const lightParams = useMemo(() => {
        // Base light colors
        const baseColor = 0x1d1d1d1
        const darkColor = 0x808080
        const groundColor = isDarkMode ? 0x404040 : 0x1d1d1d1

        // Dynamic light intensity based on model size
        const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z)
        const baseIntensity = isDarkMode ? 1 : 1.5
        const scaleFactor = Math.min(maxDimension / 2, 5) // Cap scaling

        // Increased light intensities
        const ambientLightIntensity = baseIntensity * 0.8 * scaleFactor
        const directLightIntensity = baseIntensity * 1.2 * scaleFactor
        const hemisphereLightIntensity = baseIntensity * 0.5 * scaleFactor

        return {
            baseColor,
            darkColor,
            ambientLightIntensity,
            directLightIntensity,
            hemisphereLightIntensity,
            groundColor
        }
    }, [isDarkMode, modelSize])

    return (
        <>
            {/* Adaptive ambient light */}
            <ambientLight 
                color={isDarkMode ? lightParams.darkColor : lightParams.baseColor} 
                intensity={lightParams.ambientLightIntensity} 
            />

            {/* Primary directional light with adaptive positioning */}
            <directionalLight 
                position={[10, 10, 10]} 
                intensity={lightParams.directLightIntensity} 
                color={lightParams.baseColor}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.001} // Reduce shadow artifacts
            />

            {/* Secondary directional light from opposite angle */}
            <directionalLight 
                position={[-5, 5, -5]} 
                intensity={lightParams.directLightIntensity * 0.8} 
                color={lightParams.baseColor}
            />

            {/* Soft fill light with adaptive intensity */}
            <hemisphereLight 
                color={isDarkMode ? lightParams.darkColor : lightParams.baseColor} 
                groundColor={lightParams.groundColor} 
                intensity={lightParams.hemisphereLightIntensity} 
            />
        </>
    )
}
