"use client"
import { useState, useEffect } from "react";

import { autocompletion, Completion, CompletionSource } from "@codemirror/autocomplete";
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { useTheme } from 'next-themes';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button";
import { LoaderIcon, Play } from "lucide-react";
import { toast } from "sonner"
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
const OpenIDE = () => {
    const { setTheme, theme } = useTheme();
    const [userCode, setUserCode] = useState(`// code here ! \n\n`)
    const [lang, setLang] = useState('')
    const [inputs, setInputs] = useState('')
    const [output, setOutput] = useState('')
    const [running, setRunning] = useState(false)
    const SingleCompileURL = `${process.env.NEXT_PUBLIC_LAMBDA_URL}/${lang}`;
    const RunCode = async () => {
        setRunning(true)
        try {
            let data = {
                code: userCode,
                input: inputs,
                expected_output: '',
            };
            // console.log(data.code)
            // setShowModal(true);
            // setExecuting(true);
            if (!SingleCompileURL) {
                throw new Error("Server Error");
            }
            const response = await fetch(SingleCompileURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                setRunning(false)
            }
            const res = await response.json();
            // setOutput(JSON.stringify(res.data.output))
            if (res.data) {
                setOutput(res.data.output)
                setRunning(false)
            }

            // setExecuting(false);
        } catch (error) {
            toast.warning("Something went wrong!");
            setRunning(false)
            // setShowModal(false);
            // setExecuting(false);
        }
    };





    const languageKeywords = {
        java: [
            "class",
            "public",
            "private",
            "protected",
            "static",
            "void",
            "main",
            "int",
            "String",
            "boolean",
            "if",
            "else",
            "while",
            "for",
            "try",
            "catch",
            "finally",
            "import",
            "package",
        ],
        python: [
            "def",
            "class",
            "import",
            "from",
            "as",
            "if",
            "elif",
            "else",
            "for",
            "while",
            "break",
            "continue",
            "return",
            "try",
            "except",
            "finally",
            "with",
            "lambda",
            "yield",
            "print",
        ],
        c: [
            "int",
            "float",
            "char",
            "double",
            "if",
            "else",
            "while",
            "for",
            "return",
            "void",
            "include",
            "define",
            "struct",
            "union",
            "enum",
            "typedef",
        ],
        cpp: [
            "int",
            "float",
            "double",
            "char",
            "class",
            "public",
            "private",
            "protected",
            "virtual",
            "override",
            "if",
            "else",
            "while",
            "for",
            "return",
            "namespace",
            "include",
            "template",
        ],
    };
    type SupportedLanguage = keyof typeof languageKeywords;

    const getCustomCompletionSource = (lang: SupportedLanguage): CompletionSource => {
        const keywords = languageKeywords[lang] || [];
        return (context) => {
            const word = context.matchBefore(/\w*/);
            if (!word || (word.from === word.to && !context.explicit)) return null;

            return {
                from: word.from,
                options: keywords.map((keyword) => ({
                    label: keyword,
                    type: "keyword",
                })),
            };
        };
    };

    const [languageExtension, setLanguageExtension] = useState<{
        extension: any;
        completion: CompletionSource;
    } | null>(null);

    const loadLanguageExtension = async (lang: SupportedLanguage) => {
        setLang(lang)
        switch (lang) {
            case "java": {
                const { javaLanguage } = await import("@codemirror/lang-java");
                return javaLanguage;
            }
            case "c":
            case "cpp": {
                const { cppLanguage } = await import("@codemirror/lang-cpp");
                return cppLanguage;
            }
            case "python": {
                const { pythonLanguage } = await import("@codemirror/lang-python");
                return pythonLanguage;
            }
            default:
                return null;
        }
    };
    const handleLanguageChange = async (lang: SupportedLanguage) => {
        const extension = await loadLanguageExtension(lang);
        setLanguageExtension({
            extension,
            completion: getCustomCompletionSource(lang),
        });
    };

    return (
        <>
            <div className="w-full h-[88vh] flex flex-col items-center justify-center flex-grow">
                <div className="h-full w-full flex flex-col mx-4 items-center ">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="max-w-full max-h-screen rounded-lg border">
                        <ResizablePanel defaultSize={70} minSize={60}>
                            <CodeMirror
                                value={userCode}
                                theme={theme === "dark" ? vscodeDark : eclipse}
                                extensions={[
                                    languageExtension?.extension,
                                    languageExtension?.completion &&
                                    autocompletion({ override: [languageExtension.completion] }),
                                ].filter(Boolean)}
                                style={{ fontSize: 16, minHeight: "95%" }}
                                onChange={setUserCode}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={20}>
                            <div className="h-full flex justify-center items-center flex-col gap-4">
                                <div className="h-3/6 w-full flex flex-col justify-center items-center">
                                    <div className="h-[20%] w-full flex flex-row justify-center items-center gap-[2%]">
                                        <Select onValueChange={(value) => handleLanguageChange(value as SupportedLanguage)}>
                                            <SelectTrigger className="w-[75%] h-[1/2]">
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Languages</SelectLabel>
                                                    <SelectItem value="c">C</SelectItem>
                                                    <SelectItem value="cpp">C++</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="python">Python</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Button className="w-[20%]  h-[1/2]" onClick={RunCode} disabled={running}>
                                            {running ? (
                                                <LoaderIcon className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Play className='h-4 w-4 mr-2' /> Run
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="h-[80%] w-full">
                                        <Label htmlFor="inputs" className="text-primary my-4 font-bold mx-1">Custom Inputs</Label>
                                        <Textarea placeholder="Provide custom inputs here." id="inputs"
                                            className="resize-none bg-gray-700/10 w-[98%] h-full mx-1 shadow-md"
                                            value={inputs}
                                            onChange={(e) => setInputs(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="h-3/6 w-full flex justify-center flex-col items-center">
                                    <div className="h-[90%] w-[98%] flex flex-col">
                                        <p className="text-primary font-semibold ">Output</p>
                                        <div className="h-full w-full shadow-md rounded-md my-3 overflow-hidden">
                                            {/* <ScrollArea className=" whitespace-nowrap h-full max-h-[30rem] max-w-[40rem] w-full rounded-md border">

                                                <ScrollBar orientation="horizontal" />
                                                <ScrollBar orientation="vertical" /> */}
                                            <pre className=" h-full max-h-[30rem] max-w-[40rem] w-full rounded-md border overflow-auto">
                                                {output}
                                            </pre>
                                            {/* </ScrollArea> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </>
    )
}

export default OpenIDE