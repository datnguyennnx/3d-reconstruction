import { useState, useEffect, useRef } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { ClipboardCopy, Check, Sparkles } from 'lucide-react'

interface MarkdownRendererProps {
    content: string
    isStreaming?: boolean
    onImageClick?: (src: string) => void
}

export const MarkdownRenderer = ({ content, isStreaming, onImageClick }: MarkdownRendererProps) => {
    const [processedContent, setProcessedContent] = useState('')

    useEffect(() => {
        if (isStreaming) {
            const lines = content.split('\n')
            const uniqueLines = lines.filter((line, index) => lines.indexOf(line) === index)
            setProcessedContent(uniqueLines.join('\n'))
        } else {
            setProcessedContent(content)
        }
    }, [content, isStreaming])

    const components: Components = {
        h1: ({ ...props }) => <h1 className="text-3xl font-bold my-0 text-indigo-800" {...props} />,

        h2: ({ ...props }) => (
            <h2 className="text-2xl font-semibold my-0 text-indigo-700" {...props} />
        ),

        h3: ({ ...props }) => (
            <h3 className="text-xl font-medium my-0 text-indigo-600" {...props} />
        ),

        h4: ({ ...props }) => (
            <h4 className="text-lg font-medium my-0 text-indigo-500" {...props} />
        ),

        p: ({ ...props }) => {
            // Check if the content is a base64 image
            if (
                props.children &&
                typeof props.children === 'string' &&
                props.children.startsWith('data:image')
            ) {
                return (
                    <div className="my-2 relative group">
                        <img
                            src={props.children as string}
                            alt="Generated content"
                            className="max-w-full h-auto rounded-lg"
                        />
                        <button
                            onClick={() => onImageClick?.((props.children as string) || '')}
                            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white">
                            <Sparkles className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>
                )
            }
            return <p className="leading-relaxed text-gray-700 my-0" {...props} />
        },

        ul: ({ ...props }) => <ul className="list-disc pl-6" {...props} />,

        ol: ({ ...props }) => <ol className="list-decimal pl-6" {...props} />,

        li: ({ ...props }) => <li className="mb-1" {...props} />,

        blockquote: ({ ...props }) => (
            <blockquote
                className="border-l-2 border-indigo-500 pl-4 italic my-4 text-gray-600"
                {...props}
            />
        ),

        a: ({ ...props }) => <a className="text-blue-500 hover:underline" {...props} />,

        img: ({ src, alt, ...props }) => {
            // Handle both regular markdown images and base64 images
            const isBase64 = src?.startsWith('data:image')
            return (
                <div className="my-2 relative group">
                    <img
                        src={src}
                        alt={alt || 'Generated content'}
                        className="max-w-full h-auto rounded-lg"
                        {...props}
                    />
                    <button
                        onClick={() => onImageClick?.(src || '')}
                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white">
                        <Sparkles className="w-4 h-4 text-gray-700" />
                    </button>
                </div>
            )
        },

        code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')
            return !inline && match ? (
                <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    className="mockup-code scrollbar-thin scrollbar-track-base-content/5 scrollbar-thumb-base-content/40 scrollbar-track-rounded-md scrollbar-thumb-rounded"
                    showLineNumbers={true}
                    useInlineStyles={true}
                    {...props}>
                    {codeString}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        },

        pre({ children }: any) {
            const codeRef = useRef<HTMLDivElement>(null)
            const [isCopied, setIsCopied] = useState(false)

            const handleCopy = async () => {
                if (codeRef.current) {
                    const codeElement = codeRef.current.querySelector('code')
                    if (codeElement) {
                        const codeText = codeElement.innerText
                        // Remove line numbers and extra spaces
                        const cleanedCode = codeText.replace(/^\s*\d+\s*|^\s*/gm, '').trim()
                        try {
                            await navigator.clipboard.writeText(cleanedCode)
                            setIsCopied(true)
                            setTimeout(() => setIsCopied(false), 2000)
                        } catch (err) {
                            console.error('Failed to copy text: ', err)
                        }
                    }
                }
            }

            return (
                <div className="relative overflow-x-auto" ref={codeRef}>
                    <button
                        onClick={handleCopy}
                        className="absolute right-2 top-4 z-50 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 p-2 transition-all duration-200 ease-in-out"
                        title={isCopied ? 'Copied!' : 'Copy code'}>
                        {isCopied ? <Check size={18} /> : <ClipboardCopy size={18} />}
                    </button>
                    {children}
                </div>
            )
        },

        hr: ({ ...props }) => <hr className="my-4 border-t-2 border-gray-200" {...props} />,

        table: ({ ...props }) => (
            <div className="overflow-x-auto ">
                <table className="my-0" {...props} />
            </div>
        ),

        thead: ({ ...props }) => <thead {...props} />,
        tbody: ({ ...props }) => <tbody {...props} />,
        tr: ({ ...props }) => <tr {...props} />,
        th: ({ ...props }) => <th {...props} />,
        td: ({ ...props }) => <td {...props} />,
    }

    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none scroll-smooth focus:scroll-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {processedContent}
            </ReactMarkdown>
        </div>
    )
}
