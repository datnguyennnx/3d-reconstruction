import { Dispatch, SetStateAction } from 'react'
import { ModelDetails } from '@/components/3D/types'

export interface ImageData {
    url: string
    selected: boolean
}

export interface SingleImageProps {
    imageUrl: string
    isDarkMode: boolean
}

export interface DetailsPanelProps {
    modelDetails: ModelDetails
}

export interface PreviewProps {
    objUrl: string
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    onModelLoaded: (details: ModelDetails) => void
    modelDetails: ModelDetails | null
    currentMaterial: string
    onChangeMaterial: (material: string) => void
}
