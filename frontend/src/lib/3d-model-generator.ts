/**
 * Custom error class for model generation errors
 */
export class ModelGenerationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = '3D Model Generation Error'
    }
}

/**
 * Fetch image from a URL and convert to File
 * @param imageUrl URL of the image
 * @returns Promise resolving to File
 */
export const fetchImageAsFile = async (imageUrl: string): Promise<File> => {
    try {
        // Fetch the image with CORS mode
        const response = await fetch(imageUrl, { 
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        // Get blob from response
        const blob = await response.blob()

        // Determine filename and mime type
        const filename = imageUrl.split('/').pop() || 'image.jpg'
        const mimeType = blob.type || 'image/jpeg'

        // Create File from blob
        return new File([blob], filename, { type: mimeType })
    } catch (error) {
        console.error('Error converting image URL to File:', error)
        throw new ModelGenerationError(`Failed to convert image URL to file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Convert image source to File object
 * @param src Image source (base64 or URL)
 * @returns Promise<File>
 */
export const sourceToFile = async (src: string): Promise<File> => {
    // Check if it's a base64 data URL
    if (src.startsWith('data:image')) {
        const base64Match = src.match(/^data:image\/\w+;base64,(.+)/)
        if (!base64Match) {
            throw new Error('Invalid base64 data URL format')
        }

        const base64Data = base64Match[1].replace(/\s+/g, '')

        // Generate filename with png extension
        const timestamp = Date.now()
        const generatedFilename = `image-${timestamp}.png`

        // Decode base64
        const binaryString = window.atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }

        // Create and return File object with png extension
        return new File([bytes], generatedFilename, { type: 'image/png' })
    }

    // If it's a URL, use fetchImageAsFile
    return await fetchImageAsFile(src)
}

/**
 * Generate 3D model from an image
 * @param imageInput URL or File of the image
 * @returns Promise resolving to 3D model blob URL
 */
export const generate3DModel = async (imageInput: string | File): Promise<string> => {
    try {
        // Determine the API endpoint from environment variables
        const API_ENDPOINT = process.env.NEXT_PUBLIC_3D_MODEL_API_ENDPOINT 

        if (!API_ENDPOINT) { 
            throw Error("No Env")
        }

        // Convert input to File if it's a URL
        const file = imageInput instanceof File 
            ? imageInput 
            : await fetchImageAsFile(imageInput)

        // Validate file
        if (!file || !(file instanceof File)) {
            throw new ModelGenerationError('Failed to convert image to file')
        }

        // Create FormData
        const formData = new FormData()
        formData.append('file', file)

        // Send request to 3D model generation API with comprehensive CORS handling
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(100000) // 100 seconds timeout
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new ModelGenerationError(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        // Get the 3D model file as a blob
        const modelBlob = await response.blob()
        
        // Create a blob URL for the .obj file
        return URL.createObjectURL(modelBlob)
    } catch (error) {
        console.error('3D Model Generation Error:', error)
        
        // Wrap and rethrow the error
        if (error instanceof ModelGenerationError) {
            throw error
        } else if (error instanceof Error) {
            throw new ModelGenerationError(error.message)
        } else {
            throw new ModelGenerationError('Unknown error during 3D model generation')
        }
    }
}
