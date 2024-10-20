import React from 'react'
import { Grid } from '@react-three/drei'

interface GridFloorProps {
    cellColor?: string
    sectionColor?: string
    isDarkMode?: boolean
}

export const GridFloor: React.FC<GridFloorProps> = ({
    cellColor = '#6f6f6f',
    sectionColor = '#9d4b4b',
    isDarkMode = false,
}) => {
    return (
        <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={1}
            cellColor={isDarkMode ? cellColor : cellColor}
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor={isDarkMode ? sectionColor : sectionColor}
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            position={[0, -0.01, 0]}
        />
    )
}

GridFloor.displayName = 'GridFloor'
