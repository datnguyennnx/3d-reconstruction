import { MaterialType, ModelDetails, CameraConfig } from '../3D/types'

export interface ImageData {
  file: File | null
  preview: string | null
  selected?: boolean
}

export interface MenuBarProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  toggleFullScreen: () => void
  isFullScreen: boolean
  currentMaterial: MaterialType
  onChangeMaterial: (material: MaterialType) => void
  cameraConfig?: CameraConfig
}

export interface DetailsPanelProps {
  modelDetails?: ModelDetails | null
}

export interface PreviewProps {
  objUrl: string
  isDarkMode: boolean
  toggleDarkMode: () => void
  toggleFullScreen: () => void
  isFullScreen: boolean
  onModelLoaded: (details: ModelDetails) => void
  modelDetails?: ModelDetails | null
  currentMaterial: MaterialType
  onChangeMaterial: (material: MaterialType) => void
  isModelLoading: boolean
  modelLoadingProgress: number
  modelLoadError: string | null
  cameraConfig?: CameraConfig
}
