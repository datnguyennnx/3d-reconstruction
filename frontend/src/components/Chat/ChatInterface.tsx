import { useState, useEffect, useRef } from 'react'
import { ChatRow } from './ChatRow'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dot } from '../Common/Dot'
import { ImageUpload } from '../Common/ImageUpload'
import { ImageUp } from 'lucide-react'

interface Message {
    content: string
    isUser: boolean
    isStreaming: boolean
}

interface ChatInterfaceProps {
    initialMessage: string
    onNewImage: (imageUrl: string) => void
    on3DModelChange: (modelUrl: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    initialMessage,
    onNewImage,
    on3DModelChange,
}) => {
    const [messages, setMessages] = useState<Message[]>([
        { content: initialMessage, isUser: false, isStreaming: false },
    ])
    const [input, setInput] = useState('')
    const [isConnected, setIsConnected] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [showImageUpload, setShowImageUpload] = useState(false)

    const eventSourceRef = useRef<EventSource | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim()) {
            sendMessage(input)
            setInput('')
            setIsLoading(true)
        }
    }

    const handleImageUpload = async (file: File) => {
        try {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                onNewImage(base64String)
                setShowImageUpload(false)

                // Add image preview to chat
                setMessages((prev) => [
                    ...prev,
                    {
                        content: base64String,
                        isUser: true,
                        isStreaming: false,
                    },
                ])
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Error uploading image:', error)
        }
    }

    const sendMessage = async (message: string) => {
        try {
            // Add user message to chat
            setMessages((prev) => [...prev, { content: message, isUser: true, isStreaming: false }])

            // Close any existing EventSource
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }

            // Send message to server
            const response = await fetch('http://localhost:8000/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            // Create new EventSource for streaming response
            const eventSource = new EventSource('http://localhost:8000/chat/stream')
            eventSourceRef.current = eventSource

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.content === '[END]') {
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages]
                        updatedMessages[updatedMessages.length - 1].isStreaming = false
                        return updatedMessages
                    })
                    setIsLoading(false)
                    eventSource.close()
                } else if (data.type === 'image') {
                    // Handle base64 image data
                    const imageContent = `data:image/png;base64,${data.content}`
                    setMessages((prevMessages) => {
                        const lastMessage = prevMessages[prevMessages.length - 1]
                        if (!lastMessage || lastMessage.isUser) {
                            return [
                                ...prevMessages,
                                {
                                    content: imageContent,
                                    isUser: false,
                                    isStreaming: false,
                                },
                            ]
                        } else {
                            const updatedMessages = [...prevMessages]
                            updatedMessages[updatedMessages.length - 1] = {
                                ...lastMessage,
                                content: lastMessage.content + '\n' + imageContent,
                                isStreaming: false,
                            }
                            return updatedMessages
                        }
                    })
                } else {
                    setIsLoading(false)
                    setMessages((prevMessages) => {
                        const lastMessage = prevMessages[prevMessages.length - 1]
                        if (!lastMessage || lastMessage.isUser) {
                            return [
                                ...prevMessages,
                                {
                                    content: data.content,
                                    isUser: false,
                                    isStreaming: true,
                                },
                            ]
                        } else {
                            const updatedMessages = [...prevMessages]
                            updatedMessages[updatedMessages.length - 1] = {
                                ...lastMessage,
                                content: lastMessage.content + data.content,
                                isStreaming: true,
                            }
                            return updatedMessages
                        }
                    })
                }
            }

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error)
                setIsConnected(false)
                eventSource.close()
            }
        } catch (error) {
            console.error('Error sending message:', error)
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

    // Cleanup EventSource on component unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
        }
    }, [])

    return (
        <div className={`w-full h-full flex flex-col border-2 bg-white rounded-lg overflow-hidden`}>
            <div className="h-[calc(100vh-11rem)] overflow-y-auto p-8 no-scrollbar">
                {messages.map((message, index) => (
                    <ChatRow
                        key={index}
                        message={message.content}
                        isUser={message.isUser}
                        bgColor={message.isUser ? 'bg-blue-100' : 'bg-gray-100'}
                        isStreaming={message.isStreaming}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex flex-row w-full items-center">
                <div className="w-[95%]">
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex">
                            <Input
                                type="text"
                                name="message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask for anything"
                                className={`flex-grow mr-2`}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading || !isConnected}
                                className={`text-white bg-black`}>
                                Send
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="w-[5%]">
                    <ImageUpload
                        onImageUpload={handleImageUpload}
                        maxSize={5}
                        className="bg-white shadow-lg"
                    />
                </div>
            </div>

            <div className={`px-6 py-2 space-x-4 text-sm flex items-center`}>
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
    )
}
