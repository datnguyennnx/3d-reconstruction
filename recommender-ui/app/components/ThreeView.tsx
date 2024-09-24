import React, { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import {
    OrbitControls,
    PerspectiveCamera,
    Grid,
    PerformanceMonitor,
} from '@react-three/drei'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const floorGeometry = new THREE.PlaneGeometry(20, 20)
const floorMaterial = new THREE.MeshStandardMaterial({ color: '#a0a0a0' })

function Model({ url }: { url: string }) {
    const obj = useLoader(OBJLoader, url)
    const groupRef = useRef<THREE.Group>(null)
    const { camera } = useThree()

    const vec = useMemo(() => new THREE.Vector3(), [])

    useEffect(() => {
        if (obj && groupRef.current) {
            const box = new THREE.Box3().setFromObject(obj)
            const center = box.getCenter(vec)
            obj.position.sub(center)

            const size = box.getSize(vec)
            obj.position.y = size.y / 500

            const scale = 5 / Math.max(size.x, size.y, size.z)
            obj.scale.set(scale, scale, scale)

            const maxDim = Math.max(size.x, size.y, size.z) * scale
            camera.position.set(maxDim * 0.8, maxDim * 0.8, maxDim * 0.8)
            camera.lookAt(0, maxDim / 2, 0)

            groupRef.current.add(obj.clone())
        }
    }, [obj, camera, vec])

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5
        }
    })

    return <group ref={groupRef} />
}

function Floor() {
    return (
        <Grid
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#a0a0a0"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#808080"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            position={[0, -0.01, 0]}
        />
    )
}
function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    )
}

interface ThreeViewerProps {
    objUrl: string
    isDarkMode: boolean
}

export const ThreeViewer: React.FC<ThreeViewerProps> = ({
    objUrl,
    isDarkMode,
}) => {
    const backgroundColor = isDarkMode ? '#1a1a1a' : '#f0f0f0'
    const [dpr, setDpr] = useState(1.5)

    const handleRegress = () => setDpr(1)
    const handleRecover = () => setDpr(1.5)

    return (
        <Canvas style={{ width: '100%', height: '100%' }} dpr={dpr}>
            <PerformanceMonitor
                onDecline={handleRegress}
                onIncline={handleRecover}
            >
                <color attach="background" args={[backgroundColor]} />
                <ambientLight intensity={isDarkMode ? 0.3 : 0.5} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={isDarkMode ? 0.7 : 1}
                    castShadow
                />
                <PerspectiveCamera
                    makeDefault
                    fov={50}
                    near={0.1}
                    far={1000}
                    position={[0, 5, 10]}
                />
                <OrbitControls target={[0, 2.5, 0]} enableDamping={false} />
                <Floor />
                <Suspense fallback={<LoadingFallback />}>
                    <Model url={objUrl} />
                </Suspense>
            </PerformanceMonitor>
        </Canvas>
    )
}
