'use client'

import React, { useState, useRef, useCallback } from 'react'
import { BackgroundDots } from '@/components/Common/BackgroundDot'
import { ChatInterface } from '@/components/Chat/ChatInterface'
import { Preview } from '@/components/Preview/Preview'
import { type ModelDetails } from '@/components/3D/types'
import { type MaterialType } from '@/components/3D/types'
import { type ImageData } from '@/components/Preview/types'
import { generate3DModel } from '@/lib/3d-model-generator'
import { use3DModelGenerator } from '@/hooks/use3DModelGenerator'

export default function Index() {
    // Initial welcome message with proper formatting
    const initialMessage =
        "Hi there! I'm your AI assistant. I can help you with 3D model generation and answer your questions. How can I assist you today?"

    const [images, setImages] = useState<ImageData[]>([])
    const [selectedImage, setSelectedImage] = useState(0)
    const [objUrl, setObjUrl] = useState<string>('')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null)
    const [currentMaterial, setCurrentMaterial] = useState<MaterialType>('phong')
    const [isModelLoading, setIsModelLoading] = useState(false)
    const [modelLoadingProgress, setModelLoadingProgress] = useState(0)
    const [modelLoadError, setModelLoadError] = useState<string | null>(null)
    const [isDetailsPanelVisible, setIsDetailsPanelVisible] = useState(true)

    const toggleDetailsPanel = () => {
        setIsDetailsPanelVisible((prev) => !prev)
    }

    const { downloadModel } = use3DModelGenerator()
    const fullScreenRef = useRef<HTMLDivElement>(null)

    const handleImageSelect = (index: number) => {
        setSelectedImage(index)
        setImages((prevImages) => prevImages.map((img, i) => ({ ...img, selected: i === index })))
    }

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev)
    }

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            fullScreenRef.current?.requestFullscreen()
            setIsFullScreen(true)
        } else {
            document.exitFullscreen()
            setIsFullScreen(false)
        }
    }

    const handle3DModelChange = useCallback(async (modelUrl: string) => {
        console.log('Attempting to generate 3D model from:', modelUrl)

        setIsModelLoading(true)
        setModelLoadingProgress(0)
        setModelDetails(null)
        setModelLoadError(null)

        try {
            // Handle direct blob or local URLs
            if (modelUrl.startsWith('blob:') || modelUrl.startsWith('/')) {
                console.log('Using direct blob/local URL:', modelUrl)
                setObjUrl(modelUrl)
                setIsModelLoading(false)
                setModelLoadingProgress(100)
                return
            }

            // Generate 3D model with extended timeout
            const generatedModelUrl = await Promise.race([
                generate3DModel(modelUrl),
                new Promise<string>((_, reject) =>
                    setTimeout(() => reject(new Error('Model generation timed out')), 100000),
                ),
            ])

            console.log('Generated model URL:', generatedModelUrl)
            setObjUrl(generatedModelUrl)
            setIsModelLoading(false)
            setModelLoadingProgress(100)
        } catch (error) {
            console.error('3D model generation error:', error)
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to generate 3D model'
            setModelLoadError(errorMessage)
            setIsModelLoading(false)
        }
    }, [])

    const handleModelLoaded = (details: ModelDetails) => {
        setModelDetails(details)
        setIsModelLoading(false)
        setModelLoadingProgress(100)
        setModelLoadError(null)
    }

    const handleChangeMaterial = (material: MaterialType) => {
        setCurrentMaterial(material)
    }

    const handleDownloadModel = () => {
        if (!objUrl) return

        // Generate filename based on model details
        const filename = modelDetails
            ? `3d_model_${modelDetails.vertices}v_${modelDetails.triangles}t.obj`
            : 'downloaded_model.obj'

        downloadModel(objUrl, filename)
    }

    return (
        <main
            className={`flex min-h-screen h-screen max-w-screen items-stretch p-8 relative overflow-hidden`}
        >
            <BackgroundDots className="absolute inset-0 z-0" />
            <div className="w-full h-full max-w-full z-10 relative flex">
                <div className={`w-1/2 h-full flex flex-col pr-4`}>
                    <ChatInterface
                        initialMessage={initialMessage}
                        on3DModelChange={handle3DModelChange}
                    />
                </div>
                <div className={`w-1/2 h-full`} ref={fullScreenRef}>
                    <Preview
                        objUrl={objUrl}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        toggleFullScreen={toggleFullScreen}
                        isFullScreen={isFullScreen}
                        onModelLoaded={handleModelLoaded}
                        modelDetails={modelDetails}
                        currentMaterial={currentMaterial}
                        onChangeMaterial={handleChangeMaterial}
                        isModelLoading={isModelLoading}
                        modelLoadingProgress={modelLoadingProgress}
                        modelLoadError={modelLoadError}
                        onDownloadModel={handleDownloadModel}
                        isDetailsPanelVisible={isDetailsPanelVisible}
                        toggleDetailsPanel={toggleDetailsPanel}
                    />
                </div>
            </div>
        </main>
    )
}
