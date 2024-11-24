import { useRef, useEffect, useCallback } from 'react'
import { ChatRow } from './ChatRow'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ImageUpload } from '../Common/ImageUpload'
import { useChatState } from '../../hooks/useChatState'

interface ChatInterfaceProps {
    initialMessage: string
    on3DModelChange: (modelUrl: string) => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    initialMessage,
    on3DModelChange,
}) => {
    const {
        messages,
        isLoading,
        error,
        sendMessage
    } = useChatState({ initialMessage })

    const inputRef = useRef<HTMLInputElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when new messages arrive or content changes
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ 
                behavior,
                block: 'end'
            })
        }
    }, [])

    // Handle initial scroll and message updates
    useEffect(() => {
        scrollToBottom('auto')
    }, [messages]) // Run when messages change

    // Handle message updates and scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (!chatContainerRef.current) return

            const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

            if (isNearBottom) {
                scrollToBottom()
            }
        }

        // Scroll when messages update
        handleScroll()

        // Add scroll listener
        const container = chatContainerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [messages, scrollToBottom])

    // Handle image loading and scrolling
    useEffect(() => {
        const container = chatContainerRef.current
        if (!container) return

        const images = container.getElementsByTagName('img')
        if (!images.length) return

        const handleImageLoad = () => {
            const { scrollHeight, scrollTop, clientHeight } = container
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

            if (isNearBottom) {
                scrollToBottom()
            }
        }

        Array.from(images).forEach(img => {
            if (img.complete) {
                handleImageLoad()
            } else {
                img.addEventListener('load', handleImageLoad)
            }
        })

        return () => {
            Array.from(images).forEach(img => {
                img.removeEventListener('load', handleImageLoad)
            })
        }
    }, [messages, scrollToBottom])

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const message = inputRef.current?.value.trim()
        
        if (!message || isLoading) return

        // Clear input immediately
        if (inputRef.current) {
            inputRef.current.value = ''
        }

        // Send message
        await sendMessage(message)
    }

    // Handle input key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            const form = e.currentTarget.form
            if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true }))
            }
        }
    }

    return (
        <div className="w-full h-full flex flex-col border-2 bg-white rounded-lg overflow-hidden">
            <div 
                ref={chatContainerRef}
                className="h-full overflow-y-auto p-8 no-scrollbar"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
            >
                {messages.map((message, index) => (
                    <div
                        key={`${message.isUser ? 'user' : 'ai'}-${message.timestamp}-${index}`}
                        ref={index === messages.length - 1 ? lastMessageRef : undefined}
                    >
                        <ChatRow
                            message={message.content}
                            images={message.images || []}
                            isUser={message.isUser}
                            bgColor={message.isUser ? 'bg-blue-100' : 'bg-gray-100'}
                            isStreaming={message.isStreaming}
                            isLoading={isLoading && index === messages.length - 1}
                            on3DModelGenerate={on3DModelChange}
                        />
                    </div>
                ))}
                {error && (
                    <div 
                        className="text-red-500 text-center my-2 px-4 py-2 bg-red-50 rounded"
                        role="alert"
                    >
                        {error}
                    </div>
                )}
            </div>
            <div className="flex flex-row w-full items-center border-t">
                <div className="w-[95%]">
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="flex">
                            <Input
                                ref={inputRef}
                                type="text"
                                name="message"
                                placeholder="Ask for anything"
                                className="flex-grow mr-2"
                                disabled={isLoading}
                                onKeyPress={handleKeyPress}
                                aria-label="Message input"
                            />
                            <Button
                                type="submit"
                                className="text-white bg-black hover:bg-gray-800 disabled:bg-gray-400"
                                disabled={isLoading}
                                aria-label="Send message"
                            >
                                Send
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="w-[5%]">
                    <ImageUpload
                        on3DModelGenerate={on3DModelChange}
                        maxSize={5}
                        className="bg-white shadow-lg"
                    />
                </div>
            </div>
        </div>
    )
}

ChatInterface.displayName = 'ChatInterface'
