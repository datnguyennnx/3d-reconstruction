import { ModelDetails } from '@/components/3D/types'

export interface ImageData {
    id?: string
    url: string
    name?: string
    type?: string
    selected?: boolean
}

export interface DetailsPanelProps {
    modelDetails?: ModelDetails
}

export interface PreviewProps {
    objUrl: string
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    onModelLoaded?: (details: ModelDetails) => void
    modelDetails?: ModelDetails | null
    currentMaterial: string
    onChangeMaterial: (material: string) => void
}
