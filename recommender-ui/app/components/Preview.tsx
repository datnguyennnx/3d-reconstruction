import React from 'react'
import { Button } from '~/components/ui/button'
import { ThreeViewer } from '~/components/ThreeView'

interface ImageData {
    url: string
    selected: boolean
}

interface PreviewProps {
    images: ImageData[]
    selectedImage: number
    onImageSelect: (index: number) => void
    viewMode: 'grid' | 'single' | '3d'
    objUrl: string
    isDarkMode: boolean
    toggleFullScreen: () => void
    setViewMode: (mode: 'grid' | 'single' | '3d') => void
    toggleDarkMode: () => void
    isFullScreen: boolean
}

const ImagePreview: React.FC<
    Omit<PreviewProps, 'setViewMode' | 'toggleDarkMode' | 'isFullScreen'>
> = ({
    images,
    selectedImage,
    onImageSelect,
    viewMode,
    objUrl,
    isDarkMode,
    toggleFullScreen,
}) => {
    if (images.length === 0 && viewMode !== '3d') {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100">
                No images to display
            </div>
        )
    }

    switch (viewMode) {
        case 'grid':
            return (
                <div className="grid grid-cols-2 gap-4 p-4">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer ${img.selected ? 'border-4 border-blue-500' : ''}`}
                            onClick={() => onImageSelect(index)}
                        >
                            <img
                                src={img.url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )
        case 'single':
            return (
                <div className="flex items-center justify-center h-full bg-gray-100">
                    <img
                        src={images[selectedImage].url}
                        alt="Selected Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )
        case '3d':
            return (
                <div style={{ width: '100%', height: '100%' }}>
                    <ThreeViewer objUrl={objUrl} isDarkMode={isDarkMode} />
                </div>
            )
        default:
            return null
    }
}

export const Preview: React.FC<PreviewProps> = ({
    images,
    selectedImage,
    onImageSelect,
    viewMode,
    objUrl,
    isDarkMode,
    toggleFullScreen,
    setViewMode,
    toggleDarkMode,
    isFullScreen,
}) => {
    return (
        <div
            className={`w-full h-full border-2 rounded-lg overflow-hidden bg-white flex flex-col`}
        >
            <div className="p-2 flex justify-between items-center">
                <div className="space-x-2">
                    <Button
                        onClick={() => setViewMode('grid')}
                        className={
                            viewMode === 'grid' ? 'bg-blue-600' : 'bg-blue-500'
                        }
                    >
                        Grid View
                    </Button>
                    <Button
                        onClick={() => setViewMode('single')}
                        className={
                            viewMode === 'single'
                                ? 'bg-blue-600'
                                : 'bg-blue-500'
                        }
                    >
                        Single View
                    </Button>
                    <Button
                        onClick={() => setViewMode('3d')}
                        className={
                            viewMode === '3d' ? 'bg-blue-600' : 'bg-blue-500'
                        }
                    >
                        3D View
                    </Button>
                </div>
                <div className="space-x-2">
                    <Button onClick={toggleDarkMode}>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </Button>
                    <Button onClick={toggleFullScreen}>
                        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                    </Button>
                </div>
            </div>
            <div className="flex-grow">
                <ImagePreview
                    images={images}
                    selectedImage={selectedImage}
                    onImageSelect={onImageSelect}
                    viewMode={viewMode}
                    objUrl={objUrl}
                    isDarkMode={isDarkMode}
                    toggleFullScreen={toggleFullScreen}
                />
            </div>
        </div>
    )
}
