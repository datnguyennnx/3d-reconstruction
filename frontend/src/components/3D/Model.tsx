import React, { useEffect, useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { type ModelProps, type ModelDetails } from './types'

export const Model: React.FC<ModelProps & { onModelLoaded?: (details: ModelDetails) => void }> = ({
    url,
    material,
    onModelLoaded,
    maxScale = 1,
    centerModel = true,
}) => {
    const modelRef = useRef<THREE.Group>(null)
    const { camera } = useThree()
    const [isLoading, setIsLoading] = useState(true)
    const [currentScale, setCurrentScale] = useState(0)
    const [loadError, setLoadError] = useState<string | null>(null)

    const obj = useLoader(
        OBJLoader,
        url,
        (loader) => {
            loader.setPath('') // Ensure correct path resolution
        },
        (error) => {
            console.error('Model loading error:', error)
            setLoadError('Failed to load 3D model')
            setIsLoading(false)
        },
    )

    // Comprehensive model geometry analysis
    const modelGeometry = useMemo(() => {
        try {
            const boundingBox = new THREE.Box3().setFromObject(obj)
            const size = boundingBox.getSize(new THREE.Vector3())
            const center = boundingBox.getCenter(new THREE.Vector3())

            const { lowestPoint, highestPoint, worldVertices, averageSize } =
                calculateModelGeometry(obj)

            return {
                boundingBox,
                size,
                center,
                vertices: calculateTotalVertices(obj),
                triangles: calculateTotalTriangles(obj),
                lowestPoint,
                highestPoint,
                worldVertices,
                averageSize,
            }
        } catch (error) {
            console.error('Model geometry calculation error:', error)
            return {
                boundingBox: new THREE.Box3(),
                size: new THREE.Vector3(1, 1, 1),
                center: new THREE.Vector3(),
                vertices: 0,
                triangles: 0,
                lowestPoint: 0,
                highestPoint: 0,
                worldVertices: [],
                averageSize: 1,
            }
        }
    }, [obj])

    // Intelligent scaling and positioning
    const { scaleFactor, cameraDistance, verticalOffset, horizontalOffset } = useMemo(() => {
        const maxDimension = Math.max(
            modelGeometry.size.x,
            modelGeometry.size.y,
            modelGeometry.size.z,
        )

        // Ultra-conservative scaling
        const targetSize = 0.75 // Reduced from 1.5
        const baseScale = maxDimension > 0 ? targetSize / maxDimension : 1
        const scale = Math.min(baseScale, maxScale)

        // Minimal camera distance
        const distance = Math.max(2, maxDimension * 0.8)

        // Precise vertical offset to ground the model
        const lowestPointOffset = modelGeometry.lowestPoint * scale
        const vertOffset = -lowestPointOffset

        // Horizontal centering offsets
        const horizontalXOffset = modelGeometry.center.x * scale
        const horizontalZOffset = modelGeometry.center.z * scale

        return {
            scaleFactor: scale,
            cameraDistance: distance,
            verticalOffset: vertOffset,
            horizontalOffset: {
                x: horizontalXOffset,
                z: horizontalZOffset,
            },
        }
    }, [modelGeometry, maxScale])

    // Update camera position when model loads
    useEffect(() => {
        if (!isLoading) {
            camera.position.set(cameraDistance, cameraDistance, cameraDistance)
            camera.lookAt(0, 0, 0)
        }
    }, [isLoading, cameraDistance, camera])

    // Smooth scaling animation
    useFrame(() => {
        if (currentScale < scaleFactor) {
            const delta = scaleFactor - currentScale
            const increment = Math.max(0.05, delta * 0.2)
            const newScale = Math.min(currentScale + increment, scaleFactor)
            setCurrentScale(newScale)
        }
    })

    useEffect(() => {
        if (modelRef.current && !loadError) {
            setIsLoading(true)

            try {
                const group = new THREE.Group()
                const clonedObj = obj.clone()

                // Precise model centering and positioning
                if (centerModel) {
                    // Adjust position to center horizontally
                    clonedObj.position.x -= horizontalOffset.x
                    clonedObj.position.z -= horizontalOffset.z
                }

                // Adjust vertical positioning to ground the model precisely
                clonedObj.position.y = verticalOffset

                // Mesh optimization
                clonedObj.traverse((child: THREE.Object3D) => {
                    if (child instanceof THREE.Mesh) {
                        // Material application
                        if (material) {
                            child.material = material
                        }

                        // Rendering properties
                        child.castShadow = true
                        child.receiveShadow = true

                        // Geometry optimization
                        if (child.geometry) {
                            child.geometry.computeVertexNormals()
                        }
                    }
                })

                // Scene integration
                group.add(clonedObj)
                if (modelRef.current.children.length > 0) {
                    modelRef.current.remove(modelRef.current.children[0])
                }
                modelRef.current.add(group)

                // Model details callback
                if (onModelLoaded) {
                    onModelLoaded({
                        vertices: modelGeometry.vertices,
                        triangles: modelGeometry.triangles,
                        sizeX: modelGeometry.size.x,
                        sizeY: modelGeometry.size.y,
                        sizeZ: modelGeometry.size.z,
                    })
                }

                setIsLoading(false)
            } catch (error) {
                console.error('Model processing error:', error)
                setLoadError('Error processing 3D model')
            }
        }
    }, [
        obj,
        material,
        modelGeometry,
        scaleFactor,
        onModelLoaded,
        loadError,
        centerModel,
        verticalOffset,
        horizontalOffset,
    ])

    // Error state rendering
    if (loadError) {
        return (
            <group>
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="red" wireframe />
                </mesh>
            </group>
        )
    }

    return (
        <group ref={modelRef}>
            <group scale={[currentScale, currentScale, currentScale]} />
        </group>
    )
}

// Advanced model geometry calculation
const calculateModelGeometry = (
    obj: THREE.Group,
): {
    lowestPoint: number
    highestPoint: number
    worldVertices: THREE.Vector3[]
    averageSize: number
} => {
    const worldVertices: THREE.Vector3[] = []
    let lowestY = Infinity
    let highestY = -Infinity
    let totalVertexSize = 0
    let vertexCount = 0

    obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.geometry) {
            const positionAttribute = child.geometry.getAttribute('position')

            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new THREE.Vector3(
                    positionAttribute.getX(i),
                    positionAttribute.getY(i),
                    positionAttribute.getZ(i),
                )

                // Transform vertex to world coordinates
                vertex.applyMatrix4(child.matrixWorld)
                worldVertices.push(vertex)

                // Track lowest and highest points
                lowestY = Math.min(lowestY, vertex.y)
                highestY = Math.max(highestY, vertex.y)

                // Calculate average vertex size
                totalVertexSize += vertex.length()
                vertexCount++
            }
        }
    })

    return {
        lowestPoint: lowestY === Infinity ? 0 : lowestY,
        highestPoint: highestY === -Infinity ? 0 : highestY,
        worldVertices,
        averageSize: vertexCount > 0 ? totalVertexSize / vertexCount : 1,
    }
}

// Vertex and triangle calculation functions
const calculateTotalVertices = (obj: THREE.Group): number => {
    try {
        let totalVertices = 0
        obj.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.geometry) {
                totalVertices += child.geometry.attributes.position.count
            }
        })
        return totalVertices
    } catch (error) {
        console.error('Vertex calculation error:', error)
        return 0
    }
}

const calculateTotalTriangles = (obj: THREE.Group): number => {
    try {
        let totalTriangles = 0
        obj.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.geometry) {
                totalTriangles += child.geometry.index
                    ? child.geometry.index.count / 3
                    : child.geometry.attributes.position.count / 3
            }
        })
        return totalTriangles
    } catch (error) {
        console.error('Triangle calculation error:', error)
        return 0
    }
}
