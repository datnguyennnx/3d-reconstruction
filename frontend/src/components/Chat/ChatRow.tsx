import { Logo } from '../Common/Logo'
import { LoadingDots } from '../Common/LoadingDots'
import { MarkdownRenderer } from '../Common/MarkdownRenderer'

interface ChatRowProps {
    message: string
    isUser: boolean
    bgColor: string
    isLoading?: boolean
    isStreaming?: boolean
    images?: string[]  // Add support for images from Dify
}

export const ChatRow = ({ message, isUser, bgColor, isLoading, isStreaming, images }: ChatRowProps) => {
    // Function to render message content with images
    const renderContent = () => {
        let content = message

        // If there are images from Dify, append them to the message content as markdown
        if (images && images.length > 0) {
            content += '\n\n' + images.map(img => `![Generated Image](${img})`).join('\n')
        }

        return content
    }

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
                        <MarkdownRenderer content={renderContent()} isStreaming={isStreaming} />
                    </div>
                )}
            </div>
        </div>
    )
}
