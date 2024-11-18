import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Model } from './Model'
import { GridFloor } from './GridFloor'
import { Lights } from './Lights'
import { CameraController } from './CameraController'
import { LoadingPlaceholder } from './LoadingPlaceholder'
import { ThreeViewerProps } from './types'
import * as THREE from 'three'

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    objUrl,
    isDarkMode,
    currentMaterial,
}) => {
    const material = createMaterial(currentMaterial)

    return (
        <div style={{ width: '100%'}}>
            <Canvas className='max-h-screen'>
                <color attach="background" args={[isDarkMode ? '#1a1a1a' : '#f0f0f0']} />
                <PerspectiveCamera makeDefault position={[3, 3, 3]} />
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
