import { useState, useCallback } from 'react'

interface Message {
    content: string
    isUser: boolean
    timestamp: number
    isStreaming?: boolean
    images?: string[]
}

interface UseChatStateOptions {
    initialMessage?: string
}

export const useChatState = ({ initialMessage }: UseChatStateOptions = {}) => {
    const [messages, setMessages] = useState<Message[]>(
        initialMessage 
            ? [{ 
                content: initialMessage, 
                isUser: false, 
                timestamp: Date.now(),
                isStreaming: false 
            }] 
            : []
    )
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [conversationId, setConversationId] = useState<string | null>(null)

    const sendMessage = useCallback(async (message: string) => {
        // Add user message immediately
        const userMessage: Message = {
            content: message,
            isUser: true,
            timestamp: Date.now()
        }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        setError(null)

        // Prepare AI response message
        const aiMessage: Message = {
            content: '',
            isUser: false,
            timestamp: Date.now(),
            isStreaming: true
        }
        setMessages(prev => [...prev, aiMessage])

        try {
            const response = await fetch('http://localhost:8000/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    user_id: 'default-user', // Add a default user ID
                    conversation_id: conversationId
                })
            })

            if (!response.ok) {
                throw new Error('Failed to fetch chat response')
            }

            // Process streaming response
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let fullResponse = ''
            let imageUrls: string[] = []

            while (true) {
                const { done, value } = await reader?.read() || {}
                
                if (done) break

                const chunk = decoder.decode(value)
                const events = chunk.split('\n\n')
                    .filter(event => event.startsWith('data: '))
                    .map(event => {
                        try {
                            return JSON.parse(event.replace('data: ', ''))
                        } catch {
                            return null
                        }
                    })
                    .filter(Boolean)

                for (const event of events) {
                    switch (event.event) {
                        case 'message':
                            fullResponse += event.answer || ''
                            setMessages(prev => {
                                const updatedMessages = [...prev]
                                const lastMessageIndex = updatedMessages.length - 1
                                updatedMessages[lastMessageIndex] = {
                                    ...updatedMessages[lastMessageIndex],
                                    content: fullResponse,
                                    isStreaming: true
                                }
                                return updatedMessages
                            })
                            break
                        case 'message_file':
                            if (event.type === 'image' && event.url) {
                                imageUrls.push(event.url)
                                setMessages(prev => {
                                    const updatedMessages = [...prev]
                                    const lastMessageIndex = updatedMessages.length - 1
                                    updatedMessages[lastMessageIndex] = {
                                        ...updatedMessages[lastMessageIndex],
                                        images: imageUrls
                                    }
                                    return updatedMessages
                                })
                            }
                            break
                        case 'message_end':
                            setConversationId(event.conversation_id)
                            setMessages(prev => {
                                const updatedMessages = [...prev]
                                const lastMessageIndex = updatedMessages.length - 1
                                updatedMessages[lastMessageIndex] = {
                                    ...updatedMessages[lastMessageIndex],
                                    isStreaming: false
                                }
                                return updatedMessages
                            })
                            break
                        case 'error':
                            throw new Error(event.message)
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            // Remove the last (AI) message
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setIsLoading(false)
        }
    }, [conversationId])

    return {
        messages,
        isLoading,
        error,
        sendMessage
    }
}
