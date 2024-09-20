import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

export const ThreeViewer = ({ objUrl }: { objUrl: string }) => {
    const mountRef = useRef<HTMLDivElement>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

    useEffect(() => {
        if (!mountRef.current) return

        const scene = new THREE.Scene()
        sceneRef.current = scene
        scene.background = new THREE.Color(0xf0f0f0) // Light gray background

        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        cameraRef.current = camera
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        rendererRef.current = renderer
        mountRef.current.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
        directionalLight.position.set(0, 1, 0)
        scene.add(directionalLight)

        const loader = new OBJLoader()
        loader.load(
            objUrl,
            (object) => {
                scene.add(object)

                // Center the object
                const box = new THREE.Box3().setFromObject(object)
                const center = box.getCenter(new THREE.Vector3())
                object.position.sub(center)

                // Adjust camera position
                const size = box.getSize(new THREE.Vector3())
                const maxDim = Math.max(size.x, size.y, size.z)
                camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2)
                camera.lookAt(0, 0, 0)

                controls.update()
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.error('An error happened', error)
            },
        )

        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }

        animate()

        const handleResize = () => {
            if (mountRef.current && rendererRef.current && cameraRef.current) {
                const width = mountRef.current.clientWidth
                const height = mountRef.current.clientHeight
                rendererRef.current.setSize(width, height)
                cameraRef.current.aspect = width / height
                cameraRef.current.updateProjectionMatrix()
            }
        }

        handleResize() // Initial size

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            mountRef.current?.removeChild(renderer.domElement)
        }
    }, [objUrl])

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
