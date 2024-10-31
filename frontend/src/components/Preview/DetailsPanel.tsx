import React from 'react'
import { DetailsPanelProps } from './types'

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ modelDetails }) => {
    if (!modelDetails) return null

    return (
        <div className="bg-gray-100 p-4 mt-4">
            <h2 className="text-lg font-bold mb-2">Model Details</h2>
            <p>Vertices: {modelDetails.vertices}</p>
            <p>Triangles: {modelDetails.triangles}</p>
            <p>
                Size: {modelDetails.sizeX.toFixed(2)} x {modelDetails.sizeY.toFixed(2)} x{' '}
                {modelDetails.sizeZ.toFixed(2)}
            </p>
        </div>
    )
}
