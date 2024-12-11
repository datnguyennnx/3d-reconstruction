import { type Material, Group, type Vector3, type Box3 } from 'three'
import { type ReactNode } from 'react'

// Material types shared across components
export type MaterialType = 'default' | 'metal' | 'phong' | 'normal'

// Model loading state
export type ModelLoadStatus = 'loading' | 'loaded' | 'error'

export interface ModelLoadState {
    status: ModelLoadStatus
    progress: number
    error: string | null
}

// Enhanced camera configuration type
export interface CameraConfig {
    // Basic camera properties
    position?: [number, number, number]
    fov?: number
    near?: number
    far?: number

    // Advanced camera control properties
    initialPosition?: [number, number, number]
    minDistance?: number
    maxDistance?: number

    // Orbit controls configuration
    enableDamping?: boolean
    dampingFactor?: number
    screenSpacePanning?: boolean

    // Rotation constraints
    minPolarAngle?: number
    maxPolarAngle?: number

    // Interaction settings
    zoomSpeed?: number

    // Smoothing and performance
    enableSmoothing?: boolean
    smoothingFactor?: number
}

// Camera state representation
export interface CameraState {
    target: Vector3
    position: Vector3
    zoom: number
    rotation: Vector3
    distance: number
}

// Camera control methods interface
export interface CameraControlMethods {
    reset: () => void
    update: () => void
    getCameraState: () => CameraState | null
    setTarget: (target: Vector3) => void
    setPosition: (position: Vector3) => void
    zoomToFit: (boundingBox?: Box3) => void
}

// Model size interface
export interface ModelSize {
    x: number
    y: number
    z: number
}

// Camera controller props with enhanced type support
export interface CameraControllerProps {
    config?: CameraConfig
    modelSize?: ModelSize
    ref?: React.Ref<CameraControlMethods>
}

export interface ModelDetails {
    vertices: number
    triangles: number
    sizeX: number
    sizeY: number
    sizeZ: number
}

export interface ModelProps {
    url: string
    material?: Material
    onModelLoaded?: (details: ModelDetails) => void
    onProgress?: (progress: number) => void
    onError?: (error: string) => void
    maxScale?: number
    centerModel?: boolean
    children?: ReactNode
}

export interface ThreeViewerProps {
    modelUrl: string
    objUrl?: string
    material?: Material
    cameraConfig?: CameraConfig

    // Additional properties to match Preview component
    isDarkMode?: boolean
    currentMaterial?: MaterialType
    adaptiveCamera?: boolean
    maxModelScale?: number
    isModelLoading?: boolean
    modelLoadingProgress?: number
    modelLoadError?: string | null

    // Callback props
    onModelLoaded?: (details: ModelDetails) => void
    onLoadProgress?: (progress: number) => void
    onLoadError?: (error: string) => void

    // Optional model details
    modelDetails?: ModelDetails | null
}

export interface LoadingPlaceholderProps {
    progress: number
    error: string | null
    color?: string
}

export interface MenuBarProps {
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    currentMaterial: MaterialType
    onChangeMaterial: (material: MaterialType) => void
    toggleDetailsPanel?: () => void
}
