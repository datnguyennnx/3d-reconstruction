import React from 'react'
import { Button } from '../ui/button'
import {
    MdStyle,
    MdDarkMode,
    MdLightMode,
    MdFullscreen,
    MdFullscreenExit,
    MdDownload,
    MdInfo,
    MdInfoOutline,
} from 'react-icons/md'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { type MaterialType } from '../3D/types'

interface MenuBarProps {
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    onChangeMaterial: (material: MaterialType) => void
    currentMaterial: MaterialType
    onDownloadModel?: () => void
    isDetailsPanelVisible?: boolean
    toggleDetailsPanel?: () => void
}

export const MenuBar: React.FC<MenuBarProps> = ({
    isDarkMode,
    toggleDarkMode,
    toggleFullScreen,
    isFullScreen,
    onChangeMaterial,
    currentMaterial,
    onDownloadModel,
    isDetailsPanelVisible = true,
    toggleDetailsPanel,
}) => {
    const buttonClass = `rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-200 `
    const activeButtonClass = `${buttonClass} bg-gray-200 dark:bg-gray-300 text-black dark:text-white`
    const inactiveButtonClass = `${buttonClass} ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`

    return (
        <div
            className={`${
                isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'
            } p-1.5  z-20 flex space-x-1.5 justify-end`}
        >
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className={inactiveButtonClass} title="Change Material">
                            <MdStyle className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className={`${
                            isDarkMode ? 'bg-black text-white ' : 'bg-white text-black'
                        } p-1.5 rounded-md shadow-lg`}
                    >
                        {(['basic', 'normal', 'phong', 'standard'] as MaterialType[]).map(
                            (material) => (
                                <DropdownMenuItem
                                    key={material}
                                    onClick={() => onChangeMaterial(material)}
                                    className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-50 dark:hover:text-black px-2 py-1 rounded ${
                                        currentMaterial === material
                                            ? 'bg-gray-200 dark:bg-gray-300'
                                            : ''
                                    }`}
                                >
                                    {material.charAt(0).toUpperCase() + material.slice(1)}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

            {onDownloadModel && (
                <Button
                    onClick={onDownloadModel}
                    className={inactiveButtonClass}
                    title="Download 3D Model"
                >
                    <MdDownload className="w-5 h-5" />
                </Button>
            )}

            {toggleDetailsPanel && (
                <Button
                    onClick={toggleDetailsPanel}
                    className={inactiveButtonClass}
                    title={isDetailsPanelVisible ? 'Hide Details' : 'Show Details'}
                >
                    {isDetailsPanelVisible ? (
                        <MdInfo className="w-5 h-5" />
                    ) : (
                        <MdInfoOutline className="w-5 h-5" />
                    )}
                </Button>
            )}

            <Button
                onClick={toggleDarkMode}
                className={inactiveButtonClass}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
                {isDarkMode ? (
                    <MdLightMode className="w-5 h-5" />
                ) : (
                    <MdDarkMode className="w-5 h-5" />
                )}
            </Button>
            <Button
                onClick={toggleFullScreen}
                className={inactiveButtonClass}
                title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
                {isFullScreen ? (
                    <MdFullscreenExit className="w-5 h-5" />
                ) : (
                    <MdFullscreen className="w-5 h-5" />
                )}
            </Button>
        </div>
    )
}
