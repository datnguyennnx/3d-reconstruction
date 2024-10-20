import React from 'react'
import { Color } from 'three'

interface LoadingPlaceholderProps {
    size?: [number, number, number]
    color?: string | number | Color
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
    size = [1, 1, 1],
    color = 'hotpink',
}) => (
    <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
    </mesh>
)

LoadingPlaceholder.displayName = 'LoadingPlaceholder'
