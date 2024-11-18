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
    images?: string[]
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

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (input.trim()) {
            sendMessage(input)
            setInput('')
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

            // Prepare request body
            const requestBody = JSON.stringify({
                message,
                conversation_id: conversationId,
                user_id: 'default-user'
            })

            // Create a new AI response message
            const aiResponseMessage: Message = {
                content: '',
                isUser: false,
                isStreaming: true,
                images: []
            }
            setMessages((prev) => [...prev, aiResponseMessage])

            // Send message to backend
            const response = await fetch('http://localhost:8000/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
                throw new Error('No response body')
            }

            let fullResponse = ''
            let images: string[] = []

            while (true) {
                const { done, value } = await reader.read()
                
                if (done) break

                const chunk = decoder.decode(value)
                console.log('Raw chunk:', chunk)

                try {
                    const lines = chunk.split('\n')
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6))
                                console.log('Parsed data:', data)

                                switch (data.event) {
                                    case 'message':
                                        fullResponse += data.answer || ''
                                        setMessages((prev) => {
                                            const updatedMessages = [...prev]
                                            const lastMessageIndex = updatedMessages.length - 1
                                            updatedMessages[lastMessageIndex] = {
                                                ...updatedMessages[lastMessageIndex],
                                                content: fullResponse,
                                                images: images
                                            }
                                            return updatedMessages
                                        })
                                        break

                                    case 'message_file':
                                        if (data.type === 'image' && data.url) {
                                            images.push(data.url)
                                            setMessages((prev) => {
                                                const updatedMessages = [...prev]
                                                const lastMessageIndex = updatedMessages.length - 1
                                                updatedMessages[lastMessageIndex] = {
                                                    ...updatedMessages[lastMessageIndex],
                                                    images: images
                                                }
                                                return updatedMessages
                                            })
                                        }
                                        break

                                    case 'message_end':
                                        setMessages((prev) => {
                                            const updatedMessages = [...prev]
                                            const lastMessageIndex = updatedMessages.length - 1
                                            updatedMessages[lastMessageIndex] = {
                                                ...updatedMessages[lastMessageIndex],
                                                isStreaming: false
                                            }
                                            return updatedMessages
                                        })
                                        setConversationId(data.conversation_id)
                                        break
                                }
                            } catch (parseError) {
                                console.error('Error parsing JSON:', parseError)
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error processing chunk:', error)
                }
            }
        } catch (error) {
            console.error('Error sending message:', error)
            setMessages((prev) => [
                ...prev,
                {
                    content: `Error: ${error instanceof Error ? error.message : 'Unable to send message'}. Please try again.`,
                    isUser: false,
                    isStreaming: false,
                },
            ])
        }
    }

    return (
        <div className={`w-full h-full flex flex-col border-2 bg-white rounded-lg overflow-hidden`}>
            <div className="h-full overflow-y-auto p-8 no-scrollbar">
                {messages.map((message, index) => (
                    <ChatRow
                        key={index}
                        message={message.content}
                        images={message.images}
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
