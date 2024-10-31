import React, { useRef, useEffect, useState } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { Group, Box3, Vector3, Mesh, Object3D } from 'three'
import { ModelProps } from './types'

export const Model: React.FC<ModelProps> = ({
    url,
    position = [0.5, 0, 0],
    rotation = [0, 0, 0],
    material,
}) => {
    const groupRef = useRef<Group>(null)
    const { scene } = useThree()
    const obj = useLoader(OBJLoader, url)
    const [loadedObject, setLoadedObject] = useState<Object3D | null>(null)

    useEffect(() => {
        if (obj && groupRef.current && !loadedObject) {
            const newObj = obj.clone()
            const box = new Box3().setFromObject(newObj)
            const center = box.getCenter(new Vector3())
            const size = box.getSize(new Vector3())

            // Scale the object to fit within a 2x2x2 cube
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 2 / maxDim
            newObj.scale.multiplyScalar(scale)

            // Center the object horizontally and place it directly on the floor
            newObj.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)

            // Add the object to the group
            groupRef.current.add(newObj)
            setLoadedObject(newObj)
        }
    }, [obj, url])

    useEffect(() => {
        if (loadedObject) {
            loadedObject.traverse((child) => {
                if (child instanceof Mesh) {
                    child.material = material
                }
            })
        }
    }, [loadedObject, material])

    return <group ref={groupRef} position={position} rotation={rotation} />
}

Model.displayName = 'Model'
