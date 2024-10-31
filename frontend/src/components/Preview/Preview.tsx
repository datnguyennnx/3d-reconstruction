import React from 'react'
import { ThreeViewer } from '@/components/3D'
import { MenuBar } from './MenuBar'
import { DetailsPanel } from './DetailsPanel'
import { PreviewProps } from './types'

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
    return (
        <div className="h-full flex flex-col border-2 rounded-lg overflow-hidden">
            <MenuBar
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                toggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
                onShowDetails={() => {}}
                onChangeMaterial={onChangeMaterial}
            />
            <div className="flex-grow flex">
                <ThreeViewer
                    objUrl={objUrl}
                    isDarkMode={isDarkMode}
                    currentMaterial={currentMaterial}
                />
            </div>
            {modelDetails && <DetailsPanel modelDetails={modelDetails} />}
        </div>
    )
}
