import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { CameraConfig, CameraControllerProps, ModelDetails } from './types'

// Custom camera component with adaptive configuration
export const AdaptiveCamera: React.FC<{ 
    modelDetails?: ModelDetails | null, 
    cameraConfig?: CameraConfig 
}> = ({ modelDetails, cameraConfig }) => {
    const { camera, size } = useThree()
    
    // Adaptive camera positioning based on model size
    const cameraPosition = useMemo(() => {
        if (modelDetails) {
            const maxDimension = Math.max(
                modelDetails.sizeX, 
                modelDetails.sizeY, 
                modelDetails.sizeZ
            )
            const baseDistance = Math.max(3, maxDimension * 1.5)
            return [baseDistance, baseDistance, baseDistance]
        }
        return cameraConfig?.initialPosition || [3, 3, 3]
    }, [modelDetails, cameraConfig])

    // Camera configuration
    useMemo(() => {
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = size.width / size.height
            camera.near = cameraConfig?.near || 0.1
            camera.far = cameraConfig?.far || 1000
            camera.fov = cameraConfig?.fov || 45
            camera.updateProjectionMatrix()
        }
    }, [camera, size, cameraConfig])

    return (
        <PerspectiveCamera 
            makeDefault 
            position={cameraPosition as [number, number, number]} 
            fov={45} 
            near={0.1} 
            far={1000} 
        />
    )
}

export const CameraController = forwardRef<any, CameraControllerProps>(({ 
    config = {},
    modelSize
}, ref) => {
    const { camera, gl, scene } = useThree()
    const controlsRef = useRef<any>(null)

    // Type guard for PerspectiveCamera
    const isPerspectiveCamera = (cam: THREE.Camera): cam is THREE.PerspectiveCamera => {
        return (cam as THREE.PerspectiveCamera).isPerspectiveCamera === true
    }

    // Expose comprehensive and explicit control methods
    useImperativeHandle(ref, () => ({
        reset: () => {
            const controls = controlsRef.current
            if (controls) {
                // Precise reset with configurable behavior
                const resetTarget = new THREE.Vector3(0, 0, 0)
                const resetPosition = new THREE.Vector3(
                    config.initialPosition?.[0] ?? 3, 
                    config.initialPosition?.[1] ?? 3, 
                    config.initialPosition?.[2] ?? 3
                )

                // Smooth, configurable transition
                controls.target.lerp(resetTarget, config.smoothingFactor ?? 0.5)
                camera.position.lerp(resetPosition, config.smoothingFactor ?? 0.5)
                
                controls.reset()
                camera.lookAt(resetTarget)
                controls.update()
            }
        },
        update: () => {
            const controls = controlsRef.current
            if (controls) {
                controls.update()
            }
        },
        // Enhanced, type-safe camera state retrieval
        getCameraState: () => {
            const controls = controlsRef.current
            return controls ? {
                target: controls.target.clone(),
                position: camera.position.clone(),
                zoom: isPerspectiveCamera(camera) ? camera.zoom : 1,
                rotation: camera.rotation.clone(),
                distance: controls.target.distanceTo(camera.position)
            } : null
        },
        // Direct camera manipulation methods
        setTarget: (target: THREE.Vector3) => {
            const controls = controlsRef.current
            if (controls) {
                controls.target.copy(target)
                controls.update()
            }
        },
        setPosition: (position: THREE.Vector3) => {
            if (camera) {
                camera.position.copy(position)
                camera.updateProjectionMatrix()
            }
        },
        zoomToFit: (boundingBox?: THREE.Box3) => {
            const controls = controlsRef.current
            if (controls && boundingBox && isPerspectiveCamera(camera)) {
                const center = boundingBox.getCenter(new THREE.Vector3())
                const size = boundingBox.getSize(new THREE.Vector3())
                const maxDim = Math.max(size.x, size.y, size.z)
                
                const distance = maxDim / (2 * Math.tan(camera.fov * Math.PI / 360))
                const newPosition = center.clone().add(
                    new THREE.Vector3(0, 0, distance)
                )

                camera.position.copy(newPosition)
                controls.target.copy(center)
                controls.update()
            }
        }
    }))

    // Adaptive camera configuration with enhanced flexibility
    const adaptiveCameraConfig = useCallback(() => {
        if (modelSize) {
            const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z)
            const baseDistance = Math.max(3, maxDimension * 1.5)

            return {
                initialPosition: [baseDistance, baseDistance, baseDistance] as [number, number, number],
                minDistance: Math.max(1, baseDistance * 0.5),
                maxDistance: baseDistance * 3,
                minPolarAngle: 0,
                maxPolarAngle: Math.PI / 2,
                zoomSpeed: 1.2,
                enableDamping: true,
                dampingFactor: 0.04,
                screenSpacePanning: true,
                enableSmoothing: true,
                smoothingFactor: 0.1,
                ...config
            }
        }
        return config
    }, [modelSize, config])

    // Comprehensive, flexible default configuration
    const mergedConfig: CameraConfig = {
        initialPosition: [3, 3, 3],
        minDistance: 2,
        maxDistance: Infinity,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI / 1.5,
        zoomSpeed: 1.2,
        enableDamping: true,
        dampingFactor: 0.05,
        screenSpacePanning: true,
        smoothingFactor: 0.2,
        ...adaptiveCameraConfig()
    }

    const setupCameraControls = useCallback(() => {
        const controls = controlsRef.current
        if (controls) {
            // Comprehensive control configuration
            controls.enableDamping = mergedConfig.enableDamping ?? true
            controls.dampingFactor = mergedConfig.dampingFactor ?? 0.05
            controls.screenSpacePanning = mergedConfig.screenSpacePanning ?? true

            // Precise distance and rotation constraints
            controls.minDistance = mergedConfig.minDistance ?? 1
            controls.maxDistance = mergedConfig.maxDistance ?? Infinity
            controls.minPolarAngle = mergedConfig.minPolarAngle ?? 0
            controls.maxPolarAngle = mergedConfig.maxPolarAngle ?? (Math.PI / 1.5)

            // Enhanced interaction settings
            controls.zoomSpeed = mergedConfig.zoomSpeed ?? 1.2
            controls.enableZoom = true
            controls.enablePan = true

            // Sophisticated input mapping
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
            }
            controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: THREE.TOUCH.DOLLY_PAN
            }

            // Advanced smoothing and performance
            controls.enableSmoothing = mergedConfig.enableSmoothing ?? true
            controls.smoothingFactor = mergedConfig.smoothingFactor ?? 0.1

            // Centered target with configurable transition
            controls.target.lerp(new THREE.Vector3(0, 0, 0), mergedConfig.smoothingFactor ?? 0.2)

            controls.update()
        }
    }, [mergedConfig])

    useEffect(() => {
        // Adaptive initial positioning
        const initialPos = mergedConfig.initialPosition ?? [3, 3, 3]
        const initialPosition = new THREE.Vector3(...initialPos)
        
        // Robust camera initialization with type safety
        if (isPerspectiveCamera(camera)) {
            camera.near = 0.1
            camera.far = 1000
            camera.fov = 45
            camera.updateProjectionMatrix()
        }

        // Smooth, configurable camera positioning
        camera.position.lerp(initialPosition, mergedConfig.smoothingFactor ?? 1)
        camera.lookAt(0, 0, 0)

        setupCameraControls()

        return () => {
            const controls = controlsRef.current
            if (controls) {
                controls.dispose()
            }
        }
    }, [camera, setupCameraControls, mergedConfig, modelSize])

    return <OrbitControls 
        ref={controlsRef} 
        args={[camera, gl.domElement]} 
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
    />
})

CameraController.displayName = 'CameraController'
