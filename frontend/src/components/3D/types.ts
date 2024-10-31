import * as THREE from 'three'

export interface ModelDetails {
    vertices: number
    triangles: number
    sizeX: number
    sizeY: number
    sizeZ: number
}

export interface ModelProps {
    url: string
    position?: THREE.Vector3 | [number, number, number]
    rotation?: THREE.Euler | [number, number, number]
    material: THREE.Material
}

export interface ThreeViewerProps {
    objUrl: string
    isDarkMode: boolean
    currentMaterial: string
}
