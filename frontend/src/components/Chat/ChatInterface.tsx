import { useState, useEffect, useRef } from 'react'
import { ChatRow } from './ChatRow'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dot } from '../Common/Dot'
import { ImageUpload } from '../Common/ImageUpload'

interface Message {
    content: string
    isUser: boolean
    isStreaming: boolean
    images?: string[]  // Add support for images
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
    const [conversationId, setConversationId] = useState<string | null>(null)

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
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('http://localhost:8000/api/remove-background', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to process image')
            }

            const blob = await response.blob()
            const imageUrl = URL.createObjectURL(blob)
            onNewImage(imageUrl)

            // Add image to chat
            setMessages((prev) => [
                ...prev,
                {
                    content: 'Uploaded and processed an image',
                    isUser: true,
                    isStreaming: false,
                },
            ])
        } catch (error) {
            console.error('Error uploading image:', error)
            setMessages((prev) => [
                ...prev,
                {
                    content: 'Error: Failed to process image. Please try again.',
                    isUser: false,
                    isStreaming: false,
                },
            ])
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

            // Send message to backend
            const response = await fetch('http://localhost:8000/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversation_id: conversationId,
                    user_id: 'default-user'
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            // Create new EventSource for streaming response
            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('No response body')
            }

            let currentMessage = ''
            let currentImages: string[] = []  // Track current message's images
            
            const processStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        
                        if (done) {
                            setIsLoading(false)
                            break
                        }

                        // Convert the chunk to text
                        const chunk = new TextDecoder().decode(value)
                        const lines = chunk.split('\n')

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6))
                                    
                                    switch (data.event) {
                                        case 'message':
                                            currentMessage += data.answer
                                            setMessages((prevMessages) => {
                                                const lastMessage = prevMessages[prevMessages.length - 1]
                                                if (!lastMessage || lastMessage.isUser) {
                                                    return [
                                                        ...prevMessages,
                                                        {
                                                            content: currentMessage,
                                                            isUser: false,
                                                            isStreaming: true,
                                                            images: currentImages
                                                        },
                                                    ]
                                                } else {
                                                    const updatedMessages = [...prevMessages]
                                                    updatedMessages[updatedMessages.length - 1] = {
                                                        ...lastMessage,
                                                        content: currentMessage,
                                                        images: currentImages
                                                    }
                                                    return updatedMessages
                                                }
                                            })
                                            break

                                        case 'message_file':
                                            if (data.type === 'image' && data.url) {
                                                currentImages = [...currentImages, data.url]
                                                setMessages((prevMessages) => {
                                                    const updatedMessages = [...prevMessages]
                                                    const lastMessage = updatedMessages[updatedMessages.length - 1]
                                                    if (lastMessage && !lastMessage.isUser) {
                                                        lastMessage.images = currentImages
                                                    }
                                                    return updatedMessages
                                                })
                                            }
                                            break

                                        case 'message_end':
                                            setMessages((prevMessages) => {
                                                const updatedMessages = [...prevMessages]
                                                if (updatedMessages.length > 0) {
                                                    updatedMessages[updatedMessages.length - 1].isStreaming = false
                                                }
                                                return updatedMessages
                                            })
                                            setConversationId(data.conversation_id)
                                            setIsLoading(false)
                                            // Reset tracking variables
                                            currentMessage = ''
                                            currentImages = []
                                            break

                                        case 'error':
                                            console.error('Stream error:', data)
                                            setIsLoading(false)
                                            break
                                    }
                                } catch (e) {
                                    console.error('Error parsing stream data:', e)
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error processing stream:', error)
                    setIsLoading(false)
                }
            }

            processStream()

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

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
        }
    }, [])

    return (
        <div className={`w-full h-full flex flex-col border-2 bg-white rounded-lg overflow-hidden`}>
            <div className="h-full overflow-y-auto p-8 no-scrollbar">
                {messages.map((message, index) => (
                    <ChatRow
                        key={index}
                        message={message.content}
                        images={message.images}  // Pass images to ChatRow
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
        </div>
    )
}
