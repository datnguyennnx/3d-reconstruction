import React from 'react'
import { Text } from '@react-three/drei'
import { LoadingPlaceholderProps } from './types'

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ 
    progress, 
    error, 
    color = '#000000' 
}) => {
    const displayText = error 
        ? `Error: ${error}` 
        : `Loading: ${progress.toFixed(0)}%`

    return (
        <group>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={error ? 'red' : color} wireframe />
            </mesh>
            <Text
                position={[0, 1.5, 0]}
                fontSize={0.2}
                color="white"
            >
                {displayText}
            </Text>
        </group>
    )
}

LoadingPlaceholder.displayName = 'LoadingPlaceholder'
