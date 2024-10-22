import React, { Suspense, useState, useEffect, useRef } from 'react'
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
    objUrls,
    isDarkMode,
    onModelSelect,
    currentMaterial,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [material, setMaterial] = useState(createMaterial(currentMaterial))

    useEffect(() => {
        setMaterial(createMaterial(currentMaterial))
    }, [currentMaterial])

    const calculatePosition = (index: number): [number, number, number] => {
        const spacing = 1.5 // Increased spacing between models
        return [index * spacing, 0, 0]
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}>
                <color
                    attach="background"
                    args={[isDarkMode ? '#1a1a1a' : '#f0f0f0']}
                />
                <PerspectiveCamera makeDefault position={[10, 5, 10]} />
                <CameraController />
                <Lights isDarkMode={isDarkMode} />
                <GridFloor
                    cellColor={isDarkMode ? '#4f4f4f' : '#6f6f6f'}
                    sectionColor={isDarkMode ? '#7d3b3b' : '#9d4b4b'}
                    isDarkMode={isDarkMode}
                />
                <axesHelper args={[10]} />
                <Suspense
                    fallback={
                        <LoadingPlaceholder
                            color={isDarkMode ? '#ffffff' : '#000000'}
                        />
                    }
                >
                    {objUrls.map((url, index) => (
                        <Model
                            key={url}
                            url={url}
                            position={calculatePosition(index)}
                            rotation={[0, index === 1 ? Math.PI : 0, 0]} // Rotate second object by 180 degrees
                            onSelect={onModelSelect}
                            index={index}
                            material={material}
                        />
                    ))}
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
