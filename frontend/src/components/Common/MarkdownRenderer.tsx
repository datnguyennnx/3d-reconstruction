import React, { useState, useEffect, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles } from 'lucide-react'
import { use3DModelGenerator } from '../../hooks/use3DModelGenerator'
import { sourceToFile } from '../../lib/3d-model-generator'

interface MarkdownRendererProps {
    content: string
    isStreaming?: boolean
    images?: string[]
    on3DModelGenerate?: (src: string) => void
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    isStreaming,
    images = [],
    on3DModelGenerate,
}) => {
    const [processedContent, setProcessedContent] = useState(content)
    const { generateModel } = use3DModelGenerator()

    // Enhanced content processing with streaming support
    useEffect(() => {
        setProcessedContent(content)
    }, [content, isStreaming])

    // Robust URL validation helper
    const isValidUrl = useCallback((url: string): boolean => {
        try {
            const parsedUrl = new URL(url)
            return ['http:', 'https:', 'data:'].includes(parsedUrl.protocol)
        } catch {
            return (
                url.startsWith('data:') ||
                url.startsWith('http') ||
                url.startsWith('https') ||
                url.startsWith('/')
            )
        }
    }, [])

    // Simplified handler to convert source to File and generate 3D model
    const handleGenerate3DModel = useCallback(
        async (sourceUrl: string) => {
            if (!on3DModelGenerate || !isValidUrl(sourceUrl)) return

            try {
                // Convert source to File
                const imageFile = await sourceToFile(sourceUrl)

                // Generate 3D model
                generateModel(imageFile, (modelUrl) => {
                    on3DModelGenerate(modelUrl)
                })
            } catch (error) {
                console.error('Error generating 3D model:', error)
                alert(error instanceof Error ? error.message : 'Failed to generate 3D model')
            }
        },
        [on3DModelGenerate, generateModel, isValidUrl],
    )

    // Memoized markdown components for consistent rendering
    const components: Components = useMemo(
        () => ({
            h1: ({ ...props }) => (
                <h1 className="text-3xl font-bold my-0 text-indigo-800" {...props} />
            ),
            h2: ({ ...props }) => (
                <h2 className="text-2xl font-semibold my-0 text-indigo-700" {...props} />
            ),
            h3: ({ ...props }) => (
                <h3 className="text-xl font-medium my-0 text-indigo-600" {...props} />
            ),
            h4: ({ ...props }) => (
                <h4 className="text-lg font-medium my-0 text-indigo-500" {...props} />
            ),
            p: ({ ...props }) => (
                <p
                    className={`leading-relaxed text-gray-700 my-0 ${isStreaming ? 'animate-pulse text-gray-500' : ''}`}
                    {...props}
                />
            ),
            ul: ({ ...props }) => <ul className="list-disc pl-6" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-6" {...props} />,
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            blockquote: ({ ...props }) => (
                <blockquote
                    className={`border-l-4 border-indigo-500 pl-4 italic my-4 text-gray-600 ${isStreaming ? 'opacity-50' : ''}`}
                    {...props}
                />
            ),
            a: ({ ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
            img: ({ src, alt, ...props }) => {
                // Enhanced image rendering with validation
                const validSrc = src && isValidUrl(src) ? src : null

                return validSrc ? (
                    <div className="my-2 relative group">
                        <img
                            src={validSrc}
                            alt={alt || 'Generated content'}
                            className={`max-w-full h-auto rounded-lg ${isStreaming ? 'opacity-50' : ''}`}
                            {...props}
                        />
                        {on3DModelGenerate && (
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={() => handleGenerate3DModel(validSrc)}
                                    className="p-2 bg-white/80 rounded-full hover:bg-white"
                                >
                                    <Sparkles className="w-4 h-4 text-gray-700" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : null
            },
        }),
        [isStreaming, handleGenerate3DModel, on3DModelGenerate, isValidUrl],
    )

    return (
        <div
            className={`prose prose-zinc dark:prose-invert max-w-none scroll-smooth focus:scroll-auto ${isStreaming ? 'animate-pulse-subtle' : ''}`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {processedContent}
            </ReactMarkdown>
        </div>
    )
}

MarkdownRenderer.displayName = 'MarkdownRenderer'
