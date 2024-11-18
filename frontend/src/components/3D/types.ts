import * as THREE from 'three'

export interface ModelDetails {
    vertices: number
    triangles: number
    sizeX: number
    sizeY: number
    sizeZ: number
    boundingBox?: {
        min: { x: number, y: number, z: number }
        max: { x: number, y: number, z: number }
    }
}

export interface ModelProps {
    url: string
    position?: THREE.Vector3 | [number, number, number]
    rotation?: THREE.Euler | [number, number, number]
    material: THREE.Material
    
    // Enhanced model rendering options
    maxScale?: number // Maximum scaling limit
    centerModel?: boolean // Auto-center model in scene
    
    // Optional rendering customization
    wireframe?: boolean
    opacity?: number
}

export interface ThreeViewerProps {
    objUrl: string
    isDarkMode: boolean
    currentMaterial: MaterialType
    onModelLoaded?: (details: ModelDetails) => void
    
    // Advanced rendering options
    adaptiveCamera?: boolean // Dynamic camera positioning
    maxModelScale?: number // Global max model scale
    
    // Scene customization
    showAxes?: boolean
    showGrid?: boolean
    backgroundColor?: string
}

// Comprehensive material type definition
export type MaterialType = 
    | 'basic' 
    | 'normal' 
    | 'phong' 
    | 'standard' 
    | 'wireframe'
    | 'transparent'
    | 'custom'

// Advanced camera configuration
export interface CameraConfig {
    initialPosition?: [number, number, number]
    minDistance?: number
    maxDistance?: number
    minPolarAngle?: number
    maxPolarAngle?: number
    zoomSpeed?: number
}

// Lighting configuration
export interface LightingConfig {
    ambientIntensity?: number
    directLightIntensity?: number
    shadowQuality?: 'low' | 'medium' | 'high'
}
