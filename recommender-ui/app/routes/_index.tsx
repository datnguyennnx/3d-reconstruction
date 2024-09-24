import { useState, useRef } from 'react'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { BackgroundDots } from '~/components/BackgroundDot'
import { ChatInterface } from '~/components/ChatInterface'
import { Preview } from '~/components/Preview'

export const loader = async () => {
    return json({
        initialMessage: 'Hi there. May I help you with anything?',
    })
}

interface ImageData {
    url: string
    selected: boolean
}

export default function Index() {
    const { initialMessage } = useLoaderData<typeof loader>()

    const [images, setImages] = useState<ImageData[]>([
        {
            url: 'https://cafefcdn.com/thumb_w/640/203337114487263232/2023/8/17/avatar1692255709407-16922557132631187944267.jpeg',
            selected: false,
        },
        {
            url: 'https://dnsg.1cdn.vn/2019/02/07/i.doanhnhansaigon.vn-2019-02-06-_conheo1doanhnhansaigon-1549462647.jpg',
            selected: false,
        },
        {
            url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHnX6Pj9zBOyZ3HgPeFBByX8C1SS2mf6yXuQ&s',
            selected: false,
        },
        {
            url: 'https://i.ex-cdn.com/nongnghiep.vn/files/content/2023/12/29/gia-heo-hoi-hom-nay-211611_858-101142.jpg',
            selected: false,
        },
    ])
    const [selectedImage, setSelectedImage] = useState(0)
    const [viewMode, setViewMode] = useState<'grid' | 'single' | '3d'>('grid')
    const [objUrl, setObjUrl] = useState('/human.obj')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)

    const handleImageSelect = (index: number) => {
        setSelectedImage(index)
        setImages(images.map((img, i) => ({ ...img, selected: i === index })))
    }
    const fullScreenRef = useRef<HTMLDivElement>(null)

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
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
        setImages((prevImages) => [
            ...prevImages,
            { url: imageUrl, selected: false },
        ])
    }

    const handle3DModelChange = (modelUrl: string) => {
        setObjUrl(modelUrl)
        setViewMode('3d')
    }

    return (
        <main className={`flex min-h-screen items-stretch p-8 relative`}>
            <BackgroundDots className="absolute inset-0 z-0" />
            <div className="w-full z-10 relative flex">
                {/* Chat Section */}
                <div className={`w-1/2 h-full flex flex-col mr-4`}>
                    <ChatInterface
                        initialMessage={initialMessage}
                        onNewImage={handleNewImage}
                        on3DModelChange={handle3DModelChange}
                    />
                </div>
                {/* Preview Section */}
                <div
                    className={`w-1/2 h-[calc(100vh-4rem)]`}
                    ref={fullScreenRef}
                >
                    <Preview
                        images={images}
                        selectedImage={selectedImage}
                        onImageSelect={handleImageSelect}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        objUrl={objUrl}
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        toggleFullScreen={toggleFullScreen}
                        isFullScreen={isFullScreen}
                    />
                </div>
            </div>
        </main>
    )
}
