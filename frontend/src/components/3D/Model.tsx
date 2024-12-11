'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Text } from '@react-three/drei'
import { type ModelProps, ModelDetails, type ModelLoadState } from './types'

// Utility function to calculate model geometry
const calculateModelGeometry = (obj: THREE.Group) => {
    const boundingBox = new THREE.Box3().setFromObject(obj)
    const size = boundingBox.getSize(new THREE.Vector3())
    const center = boundingBox.getCenter(new THREE.Vector3())

    let vertices = 0
    let triangles = 0

    obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.geometry) {
            vertices += child.geometry.attributes.position.count
            triangles += child.geometry.index
                ? child.geometry.index.count / 3
                : child.geometry.attributes.position.count / 3
        }
    })

    return {
        size,
        center,
        vertices,
        triangles,
        boundingBox,
    }
}

export const Model: React.FC<ModelProps> = ({
    url,
    material,
    onModelLoaded,
    onProgress,
    onError,
    maxScale = 1,
    centerModel = true,
}) => {
    const modelRef = useRef<THREE.Group>(null)
    const { gl, camera } = useThree()
    const [loadState, setLoadState] = useState<ModelLoadState>({
        status: 'loading',
        progress: 0,
        error: null,
    })
    const [currentScale, setCurrentScale] = useState(0)

    // Simplified progress handler
    const handleProgress = useCallback(
        (event: ProgressEvent) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100)
                setLoadState((prev) => ({ ...prev, progress }))
                onProgress?.(progress)
            }
        },
        [onProgress],
    )

    // Comprehensive error handler
    const handleError = useCallback(
        (error: unknown) => {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown model loading error'

            setLoadState({
                status: 'error',
                progress: 0,
                error: errorMessage,
            })
            onError?.(errorMessage)
        },
        [onError],
    )

    // File validation with more flexible checks
    const validateModelFile = useCallback(
        async (fileUrl: string) => {
            try {
                const response = await fetch(fileUrl, { method: 'HEAD' })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const contentType = response.headers.get('content-type')
                const allowedTypes = [
                    'model/obj',
                    'text/plain',
                    'application/octet-stream',
                    'application/x-tgif',
                ]

                if (!allowedTypes.some((type) => contentType?.includes(type))) {
                    throw new Error('Invalid file type')
                }
            } catch (error) {
                handleError(error)
                throw error
            }
        },
        [handleError],
    )

    // Model loading with improved error handling
    const obj = useLoader(
        OBJLoader,
        url,
        (loader) => {
            loader.setPath('')

            const xhr = new XMLHttpRequest()
            xhr.addEventListener('progress', handleProgress)
            xhr.addEventListener('error', handleError)
            xhr.open('GET', url, true)
            xhr.send()
        },
        handleError,
    )

    // Model geometry calculation
    const modelGeometry = React.useMemo(() => {
        try {
            return calculateModelGeometry(obj)
        } catch (error) {
            handleError(error)
            return {
                size: new THREE.Vector3(1, 1, 1),
                center: new THREE.Vector3(),
                vertices: 0,
                triangles: 0,
                boundingBox: new THREE.Box3(),
            }
        }
    }, [obj, handleError])

    // Scaling and positioning logic
    const { scaleFactor, verticalOffset, horizontalOffset } = React.useMemo(() => {
        const maxDimension = Math.max(
            modelGeometry.size.x,
            modelGeometry.size.y,
            modelGeometry.size.z,
        )

        const targetSize = 0.75
        const baseScale = maxDimension > 0 ? targetSize / maxDimension : 1
        const scale = Math.min(baseScale, maxScale)

        const lowestPointOffset = modelGeometry.boundingBox.min.y * scale
        const vertOffset = -lowestPointOffset

        const horizontalXOffset = modelGeometry.center.x * scale
        const horizontalZOffset = modelGeometry.center.z * scale

        return {
            scaleFactor: scale,
            verticalOffset: vertOffset,
            horizontalOffset: {
                x: horizontalXOffset,
                z: horizontalZOffset,
            },
        }
    }, [modelGeometry, maxScale])

    // Model processing effect
    const processModel = useCallback(() => {
        if (modelRef.current && loadState.status !== 'error') {
            try {
                const clonedObj = obj.clone()

                if (centerModel) {
                    clonedObj.position.x -= horizontalOffset.x
                    clonedObj.position.z -= horizontalOffset.z
                }

                clonedObj.position.y = verticalOffset

                clonedObj.traverse((child: THREE.Object3D) => {
                    if (child instanceof THREE.Mesh) {
                        if (material) child.material = material
                        child.castShadow = true
                        child.receiveShadow = true
                        child.geometry.computeVertexNormals()
                    }
                })

                // Clear previous model and add new one
                if (modelRef.current.children.length > 0) {
                    modelRef.current.remove(modelRef.current.children[0])
                }
                modelRef.current.add(clonedObj)

                // Notify model loaded
                onModelLoaded?.({
                    vertices: modelGeometry.vertices,
                    triangles: modelGeometry.triangles,
                    sizeX: modelGeometry.size.x,
                    sizeY: modelGeometry.size.y,
                    sizeZ: modelGeometry.size.z,
                })

                setLoadState((prev) => ({ ...prev, status: 'loaded' }))
            } catch (error) {
                handleError(error)
            }
        }
    }, [
        obj,
        material,
        modelGeometry,
        onModelLoaded,
        centerModel,
        verticalOffset,
        horizontalOffset,
        handleError,
        loadState.status,
    ])

    // Effects for model processing and camera positioning
    useEffect(() => {
        processModel()
    }, [processModel])

    // Smooth scaling animation
    useFrame(() => {
        if (currentScale < scaleFactor) {
            const delta = scaleFactor - currentScale
            const increment = Math.max(0.05, delta * 0.2)
            const newScale = Math.min(currentScale + increment, scaleFactor)
            setCurrentScale(newScale)
        }
    })

    // Rendering based on load state
    if (loadState.status === 'loading' || loadState.status === 'error') {
        return (
            <group ref={modelRef}>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial
                        color={loadState.status === 'error' ? 'red' : 'blue'}
                        wireframe
                    />
                </mesh>
                <Text position={[0, 1, 0]} fontSize={0.2} color="white">
                    {loadState.status === 'error'
                        ? `Error: ${loadState.error}`
                        : `Loading: ${loadState.progress}%`}
                </Text>
            </group>
        )
    }

    return (
        <group ref={modelRef}>
            <group scale={[currentScale, currentScale, currentScale]} />
        </group>
    )
}

Model.displayName = 'Model'
