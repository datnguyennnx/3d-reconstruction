import { Logo } from '../Common/Logo'
import { LoadingDots } from '../Common/LoadingDots'
import { MarkdownRenderer } from '../Common/MarkdownRenderer'

interface ChatRowProps {
    message: string
    isUser: boolean
    bgColor: string
    isLoading?: boolean
    isStreaming?: boolean
}

export const ChatRow = ({ message, isUser, bgColor, isLoading, isStreaming }: ChatRowProps) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
            <div className={`flex items-start ${isUser ? 'flex-row-reverse' : ''} max-w-[75%]`}>
                <div className="w-8 h-8 flex-shrink-0 mt-1">
                    {isUser ? <Logo type="user" /> : <Logo type="robot" />}
                </div>
                {isLoading ? (
                    <div
                        className={`mx-2 py-3 px-4 ${bgColor} rounded-lg ${
                            isUser ? 'rounded-tr-none' : 'rounded-tl-none'
                        } break-words flex-grow`}>
                        <LoadingDots />
                    </div>
                ) : (
                    <div
                        className={`mx-2 py-3 px-4 ${bgColor} rounded-lg ${
                            isUser ? 'rounded-tr-none' : 'rounded-tl-none'
                        } break-words flex-grow`}>
                        <MarkdownRenderer content={message} isStreaming={isStreaming} />
                    </div>
                )}
            </div>
        </div>
    )
}
