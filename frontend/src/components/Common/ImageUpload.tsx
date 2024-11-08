'use client'

import React, { useRef, useState } from 'react'
import { ImageUp } from 'lucide-react'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
    onImageUpload?: (file: File) => void
    className?: string
    accept?: string
    maxSize?: number // in MB
}

export const ImageUpload = ({
    onImageUpload,
    className = '',
    accept = 'image/*',
    maxSize = 5, // default 5MB
}: ImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [originalImage, setOriginalImage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleFileSelection = async (file: File) => {
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
            setError(null)

            // Set original image preview
            const originalUrl = URL.createObjectURL(file)
            setOriginalImage(originalUrl)

            // Create FormData and append the file
            const formData = new FormData()
            formData.append('file', file)

            // Send request to backend for background removal
            const response = await fetch('http://localhost:8000/api/remove-background', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to process image')
            }

            // Get the processed image blob
            const imageBlob = await response.blob()
            const processedUrl = URL.createObjectURL(imageBlob)
            setProcessedImage(processedUrl)
            setIsDialogOpen(true)

            // Call the parent's onImageUpload if provided
            onImageUpload?.(file)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process image')
            console.error('Error processing image:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelection(files[0])
        }
    }

    return (
        <>
            <div
                onClick={handleClick}
                className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    disabled={isLoading}
                />
                <ImageUp className="hover:bg-gray-200" size={28} />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[1200px] bg-white">
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        {originalImage && (
                            <div className="flex flex-col items-center space-y-4">
                                <h3 className="mb-2 text-lg font-bold">Original Image</h3>
                                <div className="relative w-full h-[600px] border">
                                    <Image
                                        src={originalImage}
                                        alt="Original image"
                                        fill
                                        className="p-4"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        )}
                        {processedImage && (
                            <div className="flex flex-col items-center space-y-4">
                                <h3 className="mb-2 text-lg font-bold">Processed Image</h3>
                                <div className="relative w-full h-[600px] border">
                                    <Image
                                        src={processedImage}
                                        alt="Processed image"
                                        fill
                                        className="p-4"
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Close
                        </Button>
                        {processedImage && (
                            <Button
                                onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = processedImage
                                    link.download = 'processed-image.png'
                                    link.click()
                                }}>
                                Download
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
