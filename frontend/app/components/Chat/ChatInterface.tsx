import { useState, useEffect, useRef } from 'react'
import { ChatRow } from './ChatRow'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Dot } from '../Common/Dot'

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
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

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
                    const imageUrl = event.data.slice(7)
                    onNewImage(imageUrl)
                } else if (event.data.startsWith('[3D]')) {
                    const modelUrl = event.data.slice(5)
                    on3DModelChange(modelUrl)
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
    }, [onNewImage, on3DModelChange])

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
        <div
            className={`w-full h-full flex flex-col border-2 bg-white rounded-lg overflow-hidden`}
        >
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
                        className={`text-white`}
                    >
                        Send
                    </Button>
                </div>
            </form>
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
