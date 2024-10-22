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
    position: THREE.Vector3 | [number, number, number]
    rotation: THREE.Euler | [number, number, number]
    onSelect: (index: number) => void
    index: number
    material: THREE.Material
}

export interface ThreeViewerProps {
    objUrls: string[]
    isDarkMode: boolean
    onModelSelect: (index: number) => void
    currentMaterial: string
}
