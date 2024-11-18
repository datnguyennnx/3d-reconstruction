import React from 'react'
import { DetailsPanelProps } from './types'

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ modelDetails }) => {
    if (!modelDetails) return null

    // Helper function to format large numbers
    const formatNumber = (num: number) => {
        return num >= 1000 
            ? `${(num / 1000).toFixed(1)}K` 
            : num.toLocaleString()
    }

    return (
        <div className="bg-white/90 dark:bg-black/90 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-300 dark:border-gray-700">
                Model Metrics
            </h2>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Vertices</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(modelDetails.vertices)}
                        </span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Triangles</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {formatNumber(modelDetails.triangles)}
                        </span>
                    </div>
                </div>
                <div>
                    <span className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Dimensions
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {['X', 'Y', 'Z'].map((axis, index) => (
                            <div 
                                key={axis} 
                                className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md text-center"
                            >
                                <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {axis}
                                </span>
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                    {[modelDetails.sizeX, modelDetails.sizeY, modelDetails.sizeZ][index].toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
