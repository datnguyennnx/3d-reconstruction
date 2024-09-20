import { useState, useEffect, useRef } from 'react'
import { json, ActionFunctionArgs } from '@remix-run/node'
import {
    useLoaderData,
    useActionData,
    useSubmit,
    useNavigation,
} from '@remix-run/react'
import { BackgroundDots } from '~/components/BackgroundDot'
import { Dot } from '~/components/Dot'
import { ChatRow } from '~/components/ChatRow'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { ThreeViewer } from '~/components/ThreeView'

interface Message {
    content: string
    isUser: boolean
    isStreaming: boolean
}

export const loader = async () => {
    return json({
        initialMessage: 'Hi there. May I help you with anything?',
    })
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()
    const message = formData.get('message')

    // Here you would typically handle the message, e.g., send it to an API
    // For now, we'll just echo it back
    return json({ response: `You said: ${message}` })
}

interface ImageData {
    url: string
    selected: boolean
}

const ImagePreview = ({
    images,
    selectedImage,
    onImageSelect,
    viewMode,
    objUrl,
}: {
    images: ImageData[]
    selectedImage: number
    onImageSelect: (index: number) => void
    viewMode: 'grid' | 'single' | '3d'
    objUrl: string
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
                <div style={{ width: '100%', height: 'calc(100% - 60px)' }}>
                    <ThreeViewer objUrl={objUrl} />
                </div>
            )
        default:
            return null
    }
}

export default function Index() {
    const { initialMessage } = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()
    const submit = useSubmit()
    const navigation = useNavigation()
    const isSubmitting = navigation.state === 'submitting'

    const [messages, setMessages] = useState<Message[]>([
        { content: initialMessage, isUser: false, isStreaming: false },
    ])
    const [input, setInput] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentImage, setCurrentImage] = useState<string | null>(
        'https://goovetvn.com/images/heo-mang-thai-bao-nhieu-ngay-thi-de.jpg',
    )
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
    const [objUrl, setObjUrl] = useState('/car.obj')

    const handleImageSelect = (index: number) => {
        setSelectedImage(index)
        setImages(images.map((img, i) => ({ ...img, selected: i === index })))
    }
    const socketRef = useRef<WebSocket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const connectWebSocket = () => {
            socketRef.current = new WebSocket('ws://localhost:8000/ws/chat')

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established')
                setIsConnected(true)
            }

            socketRef.current.onmessage = (event) => {
                console.log('Received message:', event.data)
                if (event.data === '[END]') {
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages]
                        updatedMessages[
                            updatedMessages.length - 1
                        ].isStreaming = false
                        return updatedMessages
                    })
                    setIsLoading(false)
                } else if (event.data.startsWith('[IMAGE]')) {
                    // Handle image display command
                    const imageUrl = event.data.slice(7)
                    setCurrentImage(imageUrl)
                } else {
                    setIsLoading(false)
                    setMessages((prevMessages) => {
                        const lastMessage =
                            prevMessages[prevMessages.length - 1]
                        if (!lastMessage || lastMessage.isUser) {
                            return [
                                ...prevMessages,
                                {
                                    content: event.data,
                                    isUser: false,
                                    isStreaming: true,
                                },
                            ]
                        } else {
                            const updatedMessages = [...prevMessages]
                            updatedMessages[updatedMessages.length - 1] = {
                                ...lastMessage,
                                content: lastMessage.content + event.data,
                                isStreaming: true,
                            }
                            return updatedMessages
                        }
                    })
                }
            }

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error)
                setIsConnected(false)
            }

            socketRef.current.onclose = () => {
                console.log('WebSocket connection closed')
                setIsConnected(false)
                setTimeout(connectWebSocket, 3000)
            }
        }

        connectWebSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim() && isConnected) {
            sendMessage(input)
            setInput('')
            setIsLoading(true)
        }
    }

    const sendMessage = (message: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            setMessages((prev) => [
                ...prev,
                { content: message, isUser: true, isStreaming: false },
            ])
            socketRef.current.send(message)
        } else {
            console.error('WebSocket is not connected')
            setMessages((prev) => [
                ...prev,
                {
                    content: 'Error: Unable to send message. Please try again.',
                    isUser: false,
                    isStreaming: false,
                },
            ])
            setIsLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-stretch p-8 relative">
            <BackgroundDots className="absolute inset-0 z-0" />
            <div className="w-full z-10 relative flex">
                {/* Chat Section */}
                <div className="w-1/2 h-full flex flex-col border border-gray-200 rounded-lg overflow-hidden mr-4">
                    <div className="h-[calc(100vh-11rem)] overflow-y-auto p-8 bg-white no-scrollbar">
                        {messages.map((message, index) => (
                            <ChatRow
                                key={index}
                                message={message.content}
                                isUser={message.isUser}
                                bgColor={
                                    message.isUser
                                        ? 'bg-blue-100'
                                        : 'bg-gray-100'
                                }
                                isStreaming={message.isStreaming}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 bg-white">
                        <div className="flex bg-white">
                            <Input
                                type="text"
                                name="message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for anything"
                                className="flex-grow mr-2 bg-gray-100"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !isConnected}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Send
                            </Button>
                        </div>
                    </form>
                    <div className="px-6 py-2 space-x-4 text-sm text-gray-500 border-t border-gray-200 bg-white flex items-center">
                        <div className="flex items-center">
                            <Dot status={isConnected} />
                            <p>Connection</p>
                        </div>
                        <div className="flex items-center">
                            <Dot status={isLoading} />
                            <p>Generating</p>
                        </div>
                    </div>
                </div>
                {/* Image Preview Section */}
                <div className="w-1/2 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
                    <div className="p-2 flex justify-end space-x-4">
                        <Button
                            onClick={() => setViewMode('grid')}
                            className={
                                viewMode === 'grid'
                                    ? 'bg-blue-600'
                                    : 'bg-blue-500'
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
                                viewMode === '3d'
                                    ? 'bg-blue-600'
                                    : 'bg-blue-500'
                            }
                        >
                            3D View
                        </Button>
                    </div>
                    <div className="flex-grow">
                        <ImagePreview
                            images={images}
                            selectedImage={selectedImage}
                            onImageSelect={handleImageSelect}
                            viewMode={viewMode}
                            objUrl={objUrl}
                        />
                     </div>
                </div>
            </div>
        </main>
    )
}
