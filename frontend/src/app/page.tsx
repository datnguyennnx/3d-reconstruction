'use client'

import React, { useState, useRef } from 'react'
import { BackgroundDots } from '@/components/Common/BackgroundDot'
import { ChatInterface } from '@/components/Chat/ChatInterface'
import { Preview } from '@/components/Preview/Preview'
import { ModelDetails } from '@/components/3D/types'
import { ImageData } from '@/components/Preview/types'

export default function Index() {
    const initialMessage = 'Hi there. May I help you with anything?'

    const [images, setImages] = useState<ImageData[]>([
        // ... your initial images here
    ])
    const [selectedImage, setSelectedImage] = useState(0)
    const [objUrl, setObjUrl] = useState<string>('')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null)
    const [currentMaterial, setCurrentMaterial] = useState('phong')

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

    const handleNewImage = (imageUrl: string) => {
        setImages((prevImages) => [...prevImages, { url: imageUrl, selected: false }])
    }

    const handle3DModelChange = (modelUrl: string) => {
        setObjUrl(modelUrl)
    }

    const handleModelLoaded = (details: ModelDetails) => {
        setModelDetails(details)
    }

    const handleChangeMaterial = (material: string) => {
        setCurrentMaterial(material)
    }

    return (
        <main className={`flex min-h-screen items-stretch p-8 relative`}>
            <BackgroundDots className="absolute inset-0 z-0" />
            <div className="w-full max-h-screen z-10 relative flex">
                <div className={`w-1/2 h-full flex flex-col mr-4`}>
                    <ChatInterface
                        initialMessage={initialMessage}
                        onNewImage={handleNewImage}
                        on3DModelChange={handle3DModelChange}
                    />
                </div>
                <div className={`w-1/2 max-h-screen`} ref={fullScreenRef}>
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
                    />
                </div>
            </div>
        </main>
    )
}
