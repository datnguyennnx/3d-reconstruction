import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export const CameraController: React.FC = () => {
    const { camera, gl, scene } = useThree()
    const controlsRef = useRef<any>(null)

    useEffect(() => {
        // Initial camera setup with smooth transition
        const initialPosition = new THREE.Vector3(3, 3, 3)
        camera.position.lerp(initialPosition, 1)
        camera.lookAt(0, 0, 0)

        // Adjust orbit controls
        const controls = controlsRef.current
        if (controls) {
            // Enhanced control settings for flexibility
            controls.enableDamping = true
            controls.dampingFactor = 0.05 // Smoother damping
            controls.screenSpacePanning = true

            // Remove distance constraints for unlimited zoom
            controls.minDistance = 0
            controls.maxDistance = Infinity

            // Rotation constraints to keep object in view
            controls.minPolarAngle = 0 // Allow full vertical rotation
            controls.maxPolarAngle = Math.PI // Full vertical range

            // Enhanced zoom settings
            controls.zoomSpeed = 1.2
            controls.enableZoom = true

            // Smooth target and camera movement
            controls.enableSmoothing = true
            controls.smoothingFactor = 0.125

            // Ensure camera always looks at the center
            controls.target.set(0, 0, 0)

            // Performance and interaction optimizations
            controls.enablePan = true
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            }

            // Update controls
            controls.update()
        }

        // Cleanup function
        return () => {
            if (controls) {
                controls.dispose()
            }
        }
    }, [camera])

    return (
        <OrbitControls 
            ref={controlsRef}
            args={[camera, gl.domElement]}
        />
    )
}
