import React from 'react'
import { Button } from '../ui/button'
import {
    MdInfo,
    MdStyle,
    MdDarkMode,
    MdLightMode,
    MdFullscreen,
    MdFullscreenExit,
} from 'react-icons/md'
import { BsGrid, BsFillFileImageFill, BsFillLayersFill } from 'react-icons/bs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface MenuBarProps {
    isDarkMode: boolean
    toggleDarkMode: () => void
    toggleFullScreen: () => void
    isFullScreen: boolean
    onShowDetails: () => void
    onChangeMaterial: (material: string) => void
}

export const MenuBar: React.FC<MenuBarProps> = ({
    isDarkMode,
    toggleDarkMode,
    toggleFullScreen,
    isFullScreen,
    onShowDetails,
    onChangeMaterial,
}) => {
    const buttonClass = `rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700`
    const activeButtonClass = `${buttonClass} bg-gray-200 dark:bg-gray-900 text-black dark:text-white`
    const inactiveButtonClass = `${buttonClass} ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`

    return (
        <div
            className={`${
                isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'
            } p-1.5  z-20 flex space-x-1.5 justify-end`}>
            <>
                <Button
                    onClick={onShowDetails}
                    className={inactiveButtonClass}
                    title="Show Details">
                    <MdInfo className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className={inactiveButtonClass} title="Change Material">
                            <MdStyle className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className={`${
                            isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
                        } p-1.5 rounded-md shadow-lg`}>
                        <DropdownMenuItem
                            onClick={() => onChangeMaterial('basic')}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                            Basic
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onChangeMaterial('normal')}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                            Normal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onChangeMaterial('phong')}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                            Phong
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onChangeMaterial('standard')}
                            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                            Standard
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>

            <Button
                onClick={toggleDarkMode}
                className={inactiveButtonClass}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                {isDarkMode ? (
                    <MdLightMode className="w-5 h-5" />
                ) : (
                    <MdDarkMode className="w-5 h-5" />
                )}
            </Button>
            <Button
                onClick={toggleFullScreen}
                className={inactiveButtonClass}
                title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                {isFullScreen ? (
                    <MdFullscreenExit className="w-5 h-5" />
                ) : (
                    <MdFullscreen className="w-5 h-5" />
                )}
            </Button>
        </div>
    )
}
