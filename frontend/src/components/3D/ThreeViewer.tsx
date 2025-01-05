import React, { Suspense, useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Model } from './Model'
import { Lights } from './Lights'
import { AdaptiveCamera } from './CameraController'
import { LoadingPlaceholder } from './LoadingPlaceholder'
import { DetailsPanel } from '../Preview/DetailsPanel'
import { type ThreeViewerProps, type MaterialType, type ModelDetails } from './types'
import * as THREE from 'three'

// Simplified material creation function
const createMaterial = (materialType: MaterialType): THREE.Material => {
    switch (materialType) {
        case 'metal':
            return new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.2,
                metalness: 0.8,
            })
        case 'phong':
            return new THREE.MeshPhongMaterial({
                color: 0x808080,
                shininess: 30,
                specular: 0x111111,
            })
        case 'normal':
            return new THREE.MeshNormalMaterial({
                flatShading: true,
            })
        default:
            return new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.6,
                metalness: 0.4,
            })
    }
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    objUrl,
    isDarkMode,
    currentMaterial = 'default',
    onModelLoaded,
    maxModelScale = 1,
    cameraConfig = {},
    modelDetails: initialModelDetails,
    isDetailsPanelVisible = true,
}) => {
    // Stable references for callbacks
    const onModelLoadedRef = useRef(onModelLoaded)
    onModelLoadedRef.current = onModelLoaded

    // State management
    const [modelDetails, setModelDetails] = useState<ModelDetails | null>(
        initialModelDetails || null,
    )

    const [modelLoadProgress, setModelLoadProgress] = useState(0)
    const [modelLoadError, setModelLoadError] = useState<string | null>(null)

    // Material and background color
    const material = createMaterial(currentMaterial)
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#f0f0f0'

    // Stable callbacks
    const handleModelLoaded = useCallback((details: ModelDetails) => {
        setModelDetails(details)
        setModelLoadError(null)
        setModelLoadProgress(100)

        if (onModelLoadedRef.current) {
            onModelLoadedRef.current(details)
        }
    }, [])

    const handleModelLoadProgress = useCallback((progress: number) => {
        setModelLoadProgress(progress)
    }, [])

    const handleModelLoadError = useCallback((error: string) => {
        setModelLoadError(error)
        setModelLoadProgress(0)
    }, [])

    return (
        <div className="relative w-full h-full overflow-hidden">
            {modelDetails && isDetailsPanelVisible && <DetailsPanel modelDetails={modelDetails} />}
            <Canvas
                key={objUrl} // Force re-render on URL change
                className="w-full h-full"
                gl={{
                    preserveDrawingBuffer: true,
                    antialias: true,
                    powerPreference: 'high-performance',
                }}
                performance={{
                    min: 0.5,
                }}>
                <color attach="background" args={[backgroundColor]} />
                <AdaptiveCamera modelDetails={modelDetails} cameraConfig={cameraConfig} />
                <OrbitControls enableDamping dampingFactor={0.05} enableZoom enablePan />
                <Lights
                    isDarkMode={isDarkMode}
                    modelSize={
                        modelDetails
                            ? {
                                  x: modelDetails.sizeX,
                                  y: modelDetails.sizeY,
                                  z: modelDetails.sizeZ,
                              }
                            : undefined
                    }
                />
                <Suspense
                    fallback={
                        <LoadingPlaceholder
                            progress={modelLoadProgress}
                            error={modelLoadError}
                            color={isDarkMode ? '#ffffff' : '#000000'}
                        />
                    }>
                    {objUrl && (
                        <Model
                            key={objUrl}
                            url={objUrl}
                            material={material}
                            onModelLoaded={handleModelLoaded}
                            onProgress={handleModelLoadProgress}
                            onError={handleModelLoadError}
                            maxScale={maxModelScale}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    )
}

ThreeViewer.displayName = 'ThreeViewer'
