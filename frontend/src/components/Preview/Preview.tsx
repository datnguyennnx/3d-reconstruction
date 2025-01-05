'use client'

import React from 'react'
import { ThreeViewer } from '../3D/ThreeViewer'
import { MenuBar } from './MenuBar'
import { type PreviewProps } from './types'

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
    isModelLoading,
    modelLoadingProgress,
    modelLoadError,
    onDownloadModel,
    isDetailsPanelVisible = true,
    toggleDetailsPanel,
}) => {
    return (
        <div
            className={`flex flex-col h-full w-full border-2 rounded-md ${isDarkMode ? 'dark' : 'light'}`}
        >
            <MenuBar
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                toggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
                currentMaterial={currentMaterial}
                onChangeMaterial={onChangeMaterial}
                onDownloadModel={onDownloadModel}
                isDetailsPanelVisible={isDetailsPanelVisible}
                toggleDetailsPanel={toggleDetailsPanel}
            />
            <div className="flex-grow h-full overflow-hidden">
                <ThreeViewer
                    modelUrl={objUrl}
                    objUrl={objUrl}
                    isDarkMode={isDarkMode}
                    currentMaterial={currentMaterial}
                    isModelLoading={isModelLoading}
                    modelLoadingProgress={modelLoadingProgress}
                    modelLoadError={modelLoadError}
                    onModelLoaded={onModelLoaded}
                    isDetailsPanelVisible={isDetailsPanelVisible}
                />
            </div>
        </div>
    )
}
