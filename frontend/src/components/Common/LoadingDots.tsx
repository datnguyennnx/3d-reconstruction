import React from 'react'

export const LoadingDots = () => {
    return (
        <div className="flex space-x-2 justify-center items-center h-5">
            <div
                className={`h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]`}
            ></div>
            <div
                className={`h-2 w-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]`}
            ></div>
            <div className={`h-2 w-2 bg-gray-300 rounded-full animate-bounce`}></div>
        </div>
    )
}
