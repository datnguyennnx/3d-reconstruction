import { Logo } from '../Common/Logo'
import { LoadingDots } from '../Common/LoadingDots'
import { MarkdownRenderer } from '../Common/MarkdownRenderer'

interface ChatRowProps {
    message: string
    isUser: boolean
    bgColor: string
    isLoading?: boolean
    isStreaming?: boolean
    images?: string[]
    on3DModelGenerate: (src: string) => void
}

export const ChatRow = ({
    message,
    isUser,
    bgColor,
    isLoading,
    isStreaming,
    images,
    on3DModelGenerate,
}: ChatRowProps) => {
    // Function to render message content with images
    const renderContent = () => {
        let content = message

        // Robust image handling with validation
        if (images && images.length > 0) {
            const validImages = images.filter(
                (img) =>
                    img &&
                    (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')),
            )

            if (validImages.length > 0) {
                content +=
                    '\n\n' + validImages.map((img) => `![Generated Image](${img})`).join('\n')
            }
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
                        } break-words flex-grow`}
                    >
                        <LoadingDots />
                    </div>
                ) : (
                    <div
                        className={`mx-2 py-3 px-4 ${bgColor} rounded-lg ${
                            isUser ? 'rounded-tr-none' : 'rounded-tl-none'
                        } break-words flex-grow ${isStreaming ? 'animate-pulse-subtle' : ''}`}
                    >
                        <MarkdownRenderer
                            content={renderContent()}
                            isStreaming={isStreaming}
                            images={images}
                            on3DModelGenerate={on3DModelGenerate}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

ChatRow.displayName = 'ChatRow'
