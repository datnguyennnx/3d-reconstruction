import React, { useMemo } from 'react'
import * as THREE from 'three'

interface LightsProps {
    isDarkMode?: boolean
    modelSize?: { x: number; y: number; z: number }
}

export const Lights: React.FC<LightsProps> = ({
    isDarkMode = false,
    modelSize = { x: 1, y: 1, z: 1 },
}) => {
    // Enhanced color palette with more nuanced colors
    const lightColors = useMemo(
        () => ({
            light: {
                ambient: 0xffffff, // Bright white
                directional: 0xf0f0f0, // Soft white
                ground: 0xe0e0e0, // Light gray
                shadow: 0xcccccc, // Subtle shadow tone
            },
            dark: {
                ambient: 0xffffff, // Bright white
                directional: 0xf0f0f0, // Soft white
                ground: 0xe0e0e0, // Light gray
                shadow: 0xcccccc, // Subtle shadow tone
            },
        }),
        [isDarkMode],
    )

    // Dynamic light intensity calculation based on model size
    const lightIntensities = useMemo(() => {
        const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z)

        // Base intensities with adaptive scaling
        const baseIntensity = isDarkMode ? 0.8 : 1.2
        const scaleFactor = Math.min(maxDimension / 2, 5) // Cap scaling at 5

        return {
            ambient: baseIntensity * 0.6 * scaleFactor,
            primary: baseIntensity * 1.0 * scaleFactor,
            secondary: baseIntensity * 0.4 * scaleFactor,
            hemisphere: baseIntensity * 0.5 * scaleFactor,
        }
    }, [modelSize, isDarkMode])

    // Determine color scheme based on mode
    const colors = isDarkMode ? lightColors.dark : lightColors.light

    return (
        <>
            {/* Adaptive ambient light with soft, diffuse illumination */}
            <ambientLight color={colors.ambient} intensity={lightIntensities.ambient} />

            {/* Primary directional light with enhanced shadow configuration */}
            <directionalLight
                position={[10, 10, 10]}
                intensity={lightIntensities.primary}
                color={colors.directional}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.001} // Reduce shadow artifacts
                shadow-radius={4} // Soft shadow edges
            />

            {/* Secondary directional light for balanced illumination */}
            <directionalLight
                position={[-5, 5, -5]}
                intensity={lightIntensities.secondary}
                color={colors.directional}
            />

            {/* Soft fill light with ground color variation */}
            <hemisphereLight
                color={colors.directional}
                groundColor={colors.ground}
                intensity={lightIntensities.hemisphere}
            />
        </>
    )
}

Lights.displayName = 'Lights'
