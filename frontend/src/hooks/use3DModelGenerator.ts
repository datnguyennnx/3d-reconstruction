import { useState } from 'react'
import { generate3DModel, ModelGenerationError, fetchImageAsFile } from '../lib/3d-model-generator'

/**
 * Custom hook for generating 3D models
 */
export const use3DModelGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Generate 3D model from an image
     * @param imageInput URL or File of the image
     * @param onModelGenerated Callback for successful model generation
     */
    const generateModel = async (
        imageInput: string | File,
        onModelGenerated: (modelUrl: string) => void,
    ) => {
        setIsGenerating(true)
        setError(null)

        try {
            // Determine the API endpoint from environment variables
            const API_ENDPOINT = process.env.NEXT_PUBLIC_3D_MODEL_API_ENDPOINT

            if (!API_ENDPOINT) {
                throw Error('No Env')
            }

            // Convert input to File if it's a URL
            const file =
                imageInput instanceof File ? imageInput : await fetchImageAsFile(imageInput)

            // Validate file
            if (!file || !(file instanceof File)) {
                throw new Error('Failed to convert image to file')
            }

            // Create FormData
            const formData = new FormData()
            formData.append('file', file)

            // Send request to 3D model generation API with CORS handling
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Add CORS header
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                // Add timeout to prevent hanging
                signal: AbortSignal.timeout(500000), // 500 seconds timeout
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            // Get the 3D model file as a blob
            const modelBlob = await response.blob()
            const modelUrl = URL.createObjectURL(modelBlob)

            // Call the callback with the generated model URL
            onModelGenerated(modelUrl)
        } catch (err) {
            let errorMessage = 'Failed to generate 3D model'

            if (err instanceof ModelGenerationError) {
                errorMessage = err.message
            } else if (err instanceof Error) {
                errorMessage = err.message
            }

            setError(errorMessage)
            console.error(errorMessage)
            alert(errorMessage)
        } finally {
            setIsGenerating(false)
        }
    }

    return { generateModel, isGenerating, error }
}
