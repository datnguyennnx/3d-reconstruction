import React from 'react'
import { SingleImageProps } from './types'

export const SingleImage: React.FC<SingleImageProps> = ({
    imageUrl,
    isDarkMode,
}) => {
    return (
        <div className="relative w-full h-full bg-white flex items-center justify-center">
            <div style={{ backgroundColor: isDarkMode ? 'black' : 'white' }}>
                <img src={imageUrl} alt="Selected Image" />
            </div>
        </div>
    )
}
