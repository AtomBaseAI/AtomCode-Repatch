"use client"
import React from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { javaLanguage, } from '@codemirror/lang-java';
import { useTheme } from 'next-themes';

interface CodeProps {
    Code: any
    readonly: boolean
    lang: string
}


const CodeEditor = ({ Code, readonly }: CodeProps) => {
    // console.log(Code)
    const { theme } = useTheme()
    return (
        <>
            <div className='h-full w-full overflow-auto dark:bg-[#1e1e1e]'>
                <CodeMirror
                    value={
                        Code
                    }
                    theme={theme === 'dark' ? vscodeDark : eclipse}
                    extensions={[javaLanguage]}
                    style={{ fontSize: 16 }}
                    readOnly={readonly}
                />
            </div>
        </>
    )
}

export default CodeEditor