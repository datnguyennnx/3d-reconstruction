import React from 'react'

interface LightsProps {
    isDarkMode: boolean
}

export const Lights: React.FC<LightsProps> = ({ isDarkMode }) => {
    return (
        <>
            <ambientLight intensity={isDarkMode ? 0.3 : 0.5} />
            <directionalLight
                position={[0.25, 0.88, -0.38]}
                intensity={isDarkMode ? 0.7 : 0.8}
                castShadow
            />
        </>
    )
}

Lights.displayName = 'Lights'
