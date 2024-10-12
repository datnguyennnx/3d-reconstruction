import React from 'react'
import { PreviewProps, ImageData } from './types'

interface ImageGridProps {
    images: ImageData[]
    selectedImage: number
    onImageSelect: (index: number) => void
}

export const ImageGrid: React.FC<ImageGridProps> = ({
    images,
    selectedImage,
    onImageSelect,
}) => {
    return (
        <div className="w-full h-full bg-white p-4">
            <div className="grid grid-cols-2 gap-4 p-4">
                {images.map((image: ImageData, index: number) => (
                    <div
                        key={index}
                        className={`cursor-pointer ${
                            selectedImage === index
                                ? 'border-4 border-blue-500'
                                : ''
                        }`}
                        onClick={() => onImageSelect(index)}
                    >
                        <img
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-auto"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
