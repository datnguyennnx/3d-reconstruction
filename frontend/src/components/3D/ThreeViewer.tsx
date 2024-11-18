import React, { Suspense, useEffect } from 'react'
import { Canvas, useThree, extend } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Model } from './Model'
import { GridFloor } from './GridFloor'
import { Lights } from './Lights'
import { CameraController } from './CameraController'
import { LoadingPlaceholder } from './LoadingPlaceholder'
import { ThreeViewerProps } from './types'
import * as THREE from 'three'

// Aspect Ratio Enforcer Component
const AspectRatioManager = () => {
    const { camera, size } = useThree()

    useEffect(() => {
        const aspectRatio = 16 / 9
        
        // Type assertion to PerspectiveCamera
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = aspectRatio
            camera.updateProjectionMatrix()
        }
    }, [camera, size])

    return null
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    objUrl,
    isDarkMode,
    currentMaterial,
}) => {
    const material = createMaterial(currentMaterial)

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            aspectRatio: '16 / 9',
            overflow: 'hidden'
        }}>
            <Canvas 
                className='max-h-screen'
                style={{ 
                    width: '100%', 
                    height: '100%',
                    aspectRatio: '16 / 9'
                }}
                gl={{ 
                    preserveDrawingBuffer: true,
                    antialias: true,
                }}
                camera={{ 
                    fov: 75, 
                    near: 0.1, 
                    far: 1000,
                    position: [3, 3, 3] 
                }}
            >
                <AspectRatioManager />
                <color attach="background" args={[isDarkMode ? '#1a1a1a' : '#f0f0f0']} />
                <PerspectiveCamera 
                    makeDefault 
                    fov={75} 
                    aspect={16/9} 
                    near={0.1} 
                    far={1000} 
                    position={[3, 3, 3]} 
                />
                <CameraController />
                <Lights isDarkMode={isDarkMode} />
                <GridFloor
                    cellColor={isDarkMode ? '#4f4f4f' : '#6f6f6f'}
                    sectionColor={isDarkMode ? '#7d3b3b' : '#9d4b4b'}
                    isDarkMode={isDarkMode}
                />
                <axesHelper args={[0]} />
                <Suspense
                    fallback={<LoadingPlaceholder color={isDarkMode ? '#ffffff' : '#000000'} />}>
                    {objUrl && <Model url={objUrl} material={material} />}
                </Suspense>
            </Canvas>
        </div>
    )
}

const createMaterial = (materialType: string): THREE.Material => {
    switch (materialType) {
        case 'basic':
            return new THREE.MeshBasicMaterial({ color: 0x808080 })
        case 'normal':
            return new THREE.MeshNormalMaterial()
        case 'phong':
            return new THREE.MeshPhongMaterial({ color: 0x808080 })
        case 'standard':
            return new THREE.MeshStandardMaterial({ color: 0x808080 })
        default:
            return new THREE.MeshStandardMaterial({ color: 0x808080 })
    }
}

ThreeViewer.displayName = 'ThreeViewer'
