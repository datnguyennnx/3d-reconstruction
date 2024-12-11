import React from 'react'
import * as THREE from 'three'

interface GridFloorProps {
    size?: number
    divisions?: number
    colorCenterLine?: number
    colorGrid?: number
}

export const GridFloor: React.FC<GridFloorProps> = ({
    size = 10,
    divisions = 10,
    colorCenterLine = 0x444444,
    colorGrid = 0x1f1f1f,
}) => {
    return (
        <>
            <gridHelper
                args={[size, divisions, colorCenterLine, colorGrid]}
                position={[0, -0.25, 0]}
            />

            <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[size, size]} />
                <meshStandardMaterial
                    color={0xcccccc}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </>
    )
}

GridFloor.displayName = 'GridFloor'
