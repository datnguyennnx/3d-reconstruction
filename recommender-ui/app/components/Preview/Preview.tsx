import React from 'react'
import { ImageGrid } from './ImageGrid'
import { SingleImage } from './SingleImage'
import { ThreeViewer } from '~/components/3D'
import { MenuBar } from './MenuBar'
import { DetailsPanel } from './DetailsPanel'
import { PreviewProps } from './types'

export const Preview: React.FC<PreviewProps> = ({
    images,
    selectedImage,
    onImageSelect,
    viewMode,
    setViewMode,
    objUrls,
    isDarkMode,
    toggleDarkMode,
    toggleFullScreen,
    isFullScreen,
    onModelSelect,
    selectedModel,
    onModelLoaded,
    modelDetails,
    currentMaterial,
    onChangeMaterial,
}) => {
    return (
        <div className="h-full flex flex-col">
            <MenuBar
                viewMode={viewMode}
                setViewMode={setViewMode}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                toggleFullScreen={toggleFullScreen}
                isFullScreen={isFullScreen}
                onShowDetails={() => {}}
                onChangeMaterial={onChangeMaterial}
            />
            <div className="flex-grow relative">
                {viewMode === 'grid' && (
                    <ImageGrid
                        images={images}
                        selectedImage={selectedImage}
                        onImageSelect={onImageSelect}
                    />
                )}
                {viewMode === 'single' && (
                    <SingleImage
                        imageUrl={images[selectedImage].url}
                        isDarkMode={isDarkMode}
                    />
                )}
                {viewMode === '3d' && (
                    <ThreeViewer
                        objUrls={objUrls}
                        isDarkMode={isDarkMode}
                        onModelSelect={onModelSelect}
                        currentMaterial={currentMaterial}
                    />
                )}
            </div>
            {viewMode === '3d' && modelDetails && (
                <DetailsPanel modelDetails={modelDetails} />
            )}
        </div>
    )
}
