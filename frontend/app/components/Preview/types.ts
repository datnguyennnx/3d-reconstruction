import { Dispatch, SetStateAction } from 'react'
import { ModelDetails } from '~/components/3D/types'

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
    images: ImageData[]
    selectedImage: number
    onImageSelect: (index: number) => void
    viewMode: 'grid' | 'single' | '3d'
    setViewMode: Dispatch<SetStateAction<'grid' | 'single' | '3d'>>
    objUrls: string[]
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    onModelSelect: (index: number) => void
    selectedModel: number
    onModelLoaded: (details: ModelDetails, index: number) => void
    modelDetails: ModelDetails | null
    currentMaterial: string
    onChangeMaterial: (material: string) => void
}
