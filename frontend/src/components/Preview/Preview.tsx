import React, { useState } from 'react'
import { ThreeViewer } from '@/components/3D'
import { MenuBar } from './MenuBar'
import { DetailsPanel } from './DetailsPanel'
import { PreviewProps } from './types'
import { ModelDetails, MaterialType } from '@/components/3D/types'

export const Preview: React.FC<PreviewProps> = ({
    objUrl,
    isDarkMode,
    toggleDarkMode,
    toggleFullScreen,
    isFullScreen,
    onModelLoaded,
    modelDetails,
    currentMaterial,
    onChangeMaterial,
}) => {
    const [localModelDetails, setLocalModelDetails] = useState<ModelDetails | null>(modelDetails || null)

    const handleModelLoaded = (details: ModelDetails) => {
        setLocalModelDetails(details)
        if (onModelLoaded) {
            onModelLoaded(details)
        }
    }

    // Ensure currentMaterial is of MaterialType
    const safeMaterial: MaterialType = ['basic', 'normal', 'phong', 'standard', 'wireframe', 'transparent', 'custom'].includes(currentMaterial as MaterialType) 
        ? currentMaterial as MaterialType 
        : 'standard'

    return (
        <div className="h-full flex flex-col border-2 rounded-lg overflow-hidden relative">
            <MenuBar
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                toggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
                onChangeMaterial={onChangeMaterial}
            />
            <div className="flex-grow flex relative">
                <ThreeViewer
                    objUrl={objUrl}
                    isDarkMode={isDarkMode}
                    currentMaterial={safeMaterial}
                    onModelLoaded={handleModelLoaded}
                />
                {localModelDetails && (
                    <div className="absolute top-4 left-4 z-10">
                        <DetailsPanel modelDetails={localModelDetails} />
                    </div>
                )}
            </div>
        </div>
    )
}
