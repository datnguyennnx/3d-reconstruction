'use client'

import React, { useRef, useState, useCallback, memo } from 'react'
import { ImageUp } from 'lucide-react'
import { use3DModelGenerator } from '../../hooks/use3DModelGenerator'

interface ImageUploadProps {
    on3DModelGenerate?: (modelUrl: string) => void
    className?: string
    accept?: string
    maxSize?: number // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = memo(({
    on3DModelGenerate,
    className = '',
    accept = 'image/*',
    maxSize = 5, // default 5MB
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { generateModel } = use3DModelGenerator()

    // Memoized file selection handler with comprehensive error handling
    const handleFileSelection = useCallback(async (file: File) => {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size should not exceed ${maxSize}MB`)
            return
        }

        try {
            setIsLoading(true)

            // Use the generateModel method from the hook
            await generateModel(file, (modelUrl) => {
                // Call the parent's on3DModelGenerate if provided
                on3DModelGenerate?.(modelUrl)
            })
        } catch (err) {
            console.error('Error generating 3D model:', err)
            alert(`Failed to generate 3D model: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }, [on3DModelGenerate, maxSize, generateModel])

    // Memoized click handler to open file input
    const handleClick = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // Memoized file input change handler
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelection(files[0])
        }
    }, [handleFileSelection])

    return (
        <div
            onClick={handleClick}
            className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
        >
            <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept={accept}
                onChange={handleFileInput}
                disabled={isLoading}
            />
            {isLoading ? (
                <div className="animate-spin">🔄</div>
            ) : (
                <ImageUp className="hover:bg-gray-200" size={28} />
            )}
        </div>
    )
})

ImageUpload.displayName = 'ImageUpload'
