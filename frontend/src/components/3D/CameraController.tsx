import React from 'react'
import { OrbitControls } from '@react-three/drei'
import { OrbitControlsProps } from '@react-three/drei/core/OrbitControls'

interface CameraControllerProps {
    enableDamping?: boolean
    dampingFactor?: number
    rotateSpeed?: number
    zoomSpeed?: number
    panSpeed?: number
    minDistance?: number
    maxDistance?: number
}

export const CameraController: React.FC<CameraControllerProps> = ({
    enableDamping = true,
    dampingFactor = 0.1,
    rotateSpeed = 0.5,
    zoomSpeed = 0.75,
    panSpeed = 0.75,
    minDistance = 1,
    maxDistance = 200,
}) => {
    return (
        <OrbitControls
            enableDamping={enableDamping}
            dampingFactor={dampingFactor}
            rotateSpeed={rotateSpeed}
            zoomSpeed={zoomSpeed}
            panSpeed={panSpeed}
            minDistance={minDistance}
            maxDistance={maxDistance}
        />
    )
}

CameraController.displayName = 'CameraController'
