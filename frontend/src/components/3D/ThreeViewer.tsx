import React, { Suspense, useMemo, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Model } from './Model'
import { GridFloor } from './GridFloor'
import { Lights } from './Lights'
import { CameraController } from './CameraController'
import { LoadingPlaceholder } from './LoadingPlaceholder'
import { ThreeViewerProps, MaterialType, ModelDetails } from './types'
import * as THREE from 'three'

// Aspect Ratio Enforcer Component
const AspectRatioManager = React.memo(() => {
    const { camera, size } = useThree()

    React.useEffect(() => {
        const aspectRatio = 16 / 9
        
        // Type assertion to PerspectiveCamera
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = aspectRatio
            camera.updateProjectionMatrix()
        }
    }, [camera, size])

    return null
})
AspectRatioManager.displayName = 'AspectRatioManager'

// Enhanced Axes Helper
const EnhancedAxesHelper = React.memo(() => {
    return (
        <group>
            <axesHelper args={[5]} />
        </group>
    )
})
EnhancedAxesHelper.displayName = 'EnhancedAxesHelper'

// Material creation utility
const createMaterial = (materialType: MaterialType): THREE.Material => {
    switch (materialType) {
        case 'basic':
            return new THREE.MeshBasicMaterial({ 
                color: 0x808080,
                transparent: true,
                opacity: 0.8
            })
        case 'normal':
            return new THREE.MeshNormalMaterial({
                flatShading: true
            })
        case 'phong':
            return new THREE.MeshPhongMaterial({ 
                color: 0x808080,
                shininess: 30,
                specular: 0x111111
            })
        case 'standard':
            return new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.5,
                metalness: 0.5,
                envMapIntensity: 1
            })
        default:
            return new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.6,
                metalness: 0.4
            })
    }
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    objUrl,
    isDarkMode,
    currentMaterial,
    onModelLoaded,
    adaptiveCamera = true,
    maxModelScale = 1
}) => {
    // State to track model details for adaptive rendering
    const [modelDetails, setModelDetails] = useState<{
        x: number
        y: number
        z: number
    } | null>(null)

    // Memoize material creation to prevent unnecessary re-renders
    const material = useMemo(() => createMaterial(currentMaterial as MaterialType), [currentMaterial])

    // Memoize background color to prevent unnecessary updates
    const backgroundColor = useMemo(() => 
        isDarkMode ? '#1a1a1a' : '#f0f0f0'
    , [isDarkMode])

    // Calculate floor size based on model dimensions
    const floorSize = useMemo(() => {
        if (modelDetails) {
            // Make floor 2-3 times larger than the largest model dimension
            const maxDimension = Math.max(modelDetails.x, modelDetails.y, modelDetails.z)
            return Math.max(10, maxDimension * 2.5)
        }
        return 10 // Default size
    }, [modelDetails])

    // Handle model loaded callback
    const handleModelLoaded = (details: ModelDetails) => {
        // Convert model details to the format expected by Lights
        setModelDetails({
            x: details.sizeX,
            y: details.sizeY,
            z: details.sizeZ
        })
        if (onModelLoaded) {
            onModelLoaded(details)
        }
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden'
        }}>
            <Canvas 
                className='max-h-screen'
                style={{ 
                    width: '100%', 
                    height: '100%',
                }}
                gl={{ 
                    preserveDrawingBuffer: true,
                    antialias: true,
                    powerPreference: 'high-performance'
                }}
                camera={{ 
                    fov: 45, 
                    near: 5, 
                    far: 5000,
                    position: adaptiveCamera && modelDetails 
                        ? calculateCameraPosition(modelDetails) 
                        : [10, 10, 10]
                }}
                performance={{
                    min: 0.5 // Lower bound for performance
                }}
            >
                <AspectRatioManager />
                <color attach="background" args={[backgroundColor]} />
                <PerspectiveCamera 
                    makeDefault 
                    fov={45} 
                    near={5} 
                    far={5000} 
                    position={[10, 10, 10]} 
                />
                <CameraController />
                <Lights 
                    isDarkMode={isDarkMode} 
                    modelSize={modelDetails || undefined} 
                />
               
                <EnhancedAxesHelper />
                <GridFloor 
                    size={floorSize} 
                    divisions={Math.floor(floorSize / 1)} 
                />
                <Suspense
                    fallback={<LoadingPlaceholder color={isDarkMode ? '#ffffff' : '#000000'} />}>
                    {objUrl && (
                        <Model 
                            key={objUrl} // Force re-render on URL change
                            url={objUrl} 
                            material={material} 
                            onModelLoaded={handleModelLoaded}
                            maxScale={maxModelScale}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    )
}

// Utility function to calculate adaptive camera position
const calculateCameraPosition = (modelDetails: { 
    x: number, 
    y: number, 
    z: number 
}): [number, number, number] => {
    const maxDimension = Math.max(modelDetails.x, modelDetails.y, modelDetails.z)
    const baseDistance = Math.max(3, maxDimension * 1.5)
    
    return [baseDistance, baseDistance, baseDistance]
}

ThreeViewer.displayName = 'ThreeViewer'
