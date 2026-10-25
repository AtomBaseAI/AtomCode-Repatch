"use client"
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, Minimize, Maximize, LogOut, FileQuestion } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from "@/components/theme-toggle";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import CodeQuestion from '@/components/code/code-question';
import { useEffect, useState, useTransition } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { eclipse } from '@uiw/codemirror-theme-eclipse';
import { Check, LoaderIcon, Play, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner"
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { autocompletion, Completion, CompletionSource } from "@codemirror/autocomplete";
import { enterFullscreen, exitFullscreen, fullscreenCheck } from '@/hooks/fullscreen'

interface CodeQuestion {
    id: string;
    title: string;
    description: string;
    moduleId: string | null;
    sampleinput1: string;
    sampleinput2: string;
    sampleoutput1: string;
    sampleoutput2: string;
    input1: string;
    input2: string;
    input3: string;
    output1: string;
    output2: string;
    output3: string;
    sourcecode: string | null;
    referenceimg: string | null;
    maxscore: number;
    difficulty: string;
    lang: string;
    topic: string | null;
    subtopic: string | null;
    inputconstrains: string | null;
    blacklist: string | null;
    whitelist: string | null;
}


const CodeView = ({ questions, mid, cid, }: { questions: CodeQuestion[], mid: string, cid: string }) => {
    const { theme } = useTheme();
    const [questionData, setQuestionData] = useState<CodeQuestion[]>(questions);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleQuestionClick = (index: number) => {
        resetEditorState();
        setCurrentQuestionIndex(index);
    };

    const resetEditorState = () => {
        setUserCode(`// code here ! `);
        // setOutput('');
        setOutputData(null);
        setSamplesuccess(false);
        setShowSubmit(false);
        setisSubmitted(false);
        setTestcase1Status("");
        setTestcase2Status("");
        setTestcase3Status("");
        setCompileCount(0);
        setErrorCount(0);
        setExecuting(false);
        setExecutingTestcases(false);
        setScore(0)
        setScore1(0)
        setScore2(0)
        setScore3(0)
    };
    const currentQuestion = questionData[currentQuestionIndex];

    const [showModal, setShowModal] = useState(false)
    const [executing, setExecuting] = useState(false)
    const [executingTestcases, setExecutingTestcases] = useState(false)
    const [RunTestModel, setRunTestModel] = useState(false)
    const [error, setError] = useState(false)
    const [samplesuccess, setSamplesuccess] = useState(false)
    const [outputData, setOutputData] = useState(null)
    const [userCode, setUserCode] = useState(`// code here ! \n\n`)
    const [showSubmit, setShowSubmit] = useState(false)
    const [isSubmitted, setisSubmitted] = useState(false)
    const [testcase1Status, setTestcase1Status] = useState<string>("")
    const [testcase2Status, setTestcase2Status] = useState<string>("")
    const [testcase3Status, setTestcase3Status] = useState<string>("")
    const [compileCount, setCompileCount] = useState<number>(0)
    const [errorCount, setErrorCount] = useState<number>(0)
    const [routeBtnLoading, setRouteBtnLoading] = useState<boolean>(false)
    const [score, setScore] = useState<number>(0);
    const [score1, setScore1] = useState<number>(0);
    const [score2, setScore2] = useState<number>(0);
    const [score3, setScore3] = useState<number>(0);
    const router = useRouter()

    const RunCode = async () => {
        const blacklist = currentQuestion.blacklist
            ?.split(",")
            .map(item => item.trim())
            .filter(item => item !== "") || [];

        const whitelist = currentQuestion.whitelist
            ?.split(",")
            .map(item => item.trim())
            .filter(item => item !== "") || [];

        // Check for blacklist
        const blacklistFound = blacklist.some((keyword) => userCode.includes(keyword));
        if (blacklistFound) {
            toast.error("Blacklist keyword(s) found in the code!");
            return;
        }
        // Check for whitelist
        const whitelistMissing = whitelist.some((keyword) => !userCode.includes(keyword));
        if (whitelistMissing) {
            toast.error("Whitelist keyword(s) missing in the code!");
            return;
        }
        setCompileCount(compileCount + 1);
        localStorage.setItem(currentQuestion.id, userCode);
        const SingleCompileURL = `${process.env.NEXT_PUBLIC_LAMBDA_URL}/${currentQuestion.lang}`;

        try {
            let data = {
                code: userCode,
                input: currentQuestion.sampleinput1,
                expected_output: currentQuestion.sampleoutput1,
            };
            // console.log(data.code)
            setShowModal(true);
            setExecuting(true);
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
            }
            const res = await response.json();
            if (res.data.compileMessage === "Success") {
                toast.success("Sample Testcase Passed");
                setOutputData(res.data.output);
                setSamplesuccess(true);
                if (score === 0) {
                    setScore(score + 1);
                }
            } else if (res.data.compileMessage === "Failed") {
                toast.error("Sample Testcase Failed!");
                setSamplesuccess(false);
                setErrorCount(errorCount + 1);
                setOutputData(res.data.output);
                setShowSubmit(false)
            } else if (res.data.compileMessage === "Error") {
                toast.error("Compilation Error!");
                setError(true);
                setOutputData(res.data.output);
                setErrorCount(errorCount + 1);
                setShowSubmit(false)
                console.log(res.data.output)
            }

            setExecuting(false);
        } catch (error) {
            toast.warning("Something went wrong!");
            setShowModal(false);
            setExecuting(false);
        }
    };

    const RunTestCases = async () => {
        setExecutingTestcases(true);
        setTestcase1Status("")
        setTestcase2Status("")
        setTestcase3Status("")
        setRunTestModel(true);
        const MultiCompileURL = `${process.env.NEXT_PUBLIC_LAMBDA_MULTI_URL}/${currentQuestion.lang}`
        const requestData = {
            code: userCode,
            input1: currentQuestion.input1,
            expected_output1: currentQuestion.output1,
            input2: currentQuestion.input2,
            expected_output2: currentQuestion.output2,
            input3: currentQuestion.input3,
            expected_output3: currentQuestion.output3,
        };
        try {
            const response = await fetch(MultiCompileURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const res = await response.json();

            if (res.data) {
                setTestcase1Status(res.data.test_case1 === "Success" ? "pass" : "fail");
                setTestcase2Status(res.data.test_case2 === "Success" ? "pass" : "fail");
                setTestcase3Status(res.data.test_case3 === "Success" ? "pass" : "fail");

                if (res.data.test_case1 === "Success") {
                    if (score1 === 0) {
                        setScore1(score1 + 3);
                    }
                }
                else if (res.data.test_case1 === "Error") {
                    setErrorCount(errorCount + 1);
                }
                if (res.data.test_case2 === "Success") {
                    if (score2 === 0) {
                        setScore2(score2 + 3);
                    }
                }
                else if (res.data.test_case2 === "Error") {
                    setErrorCount(errorCount + 1);
                }
                if (res.data.test_case3 === "Success") {
                    if (score3 === 0) {
                        setScore3(score3 + 3);
                    }
                }
                else if (res.data.test_case3 === "Error") {
                    setErrorCount(errorCount + 1);
                }
            }
            setExecutingTestcases(false);
            setShowSubmit(true);
        } catch (error) {
            toast.warning("Something went wrong!");
            setExecutingTestcases(false);
            setRunTestModel(false);
        }
    };

    const closeTestCaseModel = () => {
        setShowModal(false);
        setOutputData(null);
        setExecutingTestcases(false);
        setRunTestModel(false);
    };

    const closeRunModel = () => {
        setShowModal(false);
        setError(false)
        setOutputData(null)
    }


    const submitCode = () => {
        setRouteBtnLoading(true)

    }


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

    useEffect(() => {
        if (
            currentQuestion?.lang &&
            ["java", "python", "c", "cpp"].includes(currentQuestion.lang)
        ) {
            const lang = currentQuestion.lang as SupportedLanguage;
            loadLanguageExtension(lang).then((extension) => {
                setLanguageExtension({
                    extension,
                    completion: getCustomCompletionSource(lang),
                });
            });
        }
    }, [currentQuestion]);
    const [fullscreen, setFullscreen] = useState(fullscreenCheck())

    useEffect(() => {
        const handleFullscreenChange = () => setFullscreen(fullscreenCheck())

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('mozfullscreenchange', handleFullscreenChange)
        document.addEventListener('MSFullscreenChange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
        }
    }, [])

    const toggleFullscreen = () => {
        if (fullscreen) {
            exitFullscreen()
        } else {
            const element = document.documentElement
            enterFullscreen(element)
        }
    }
    const handleRoute = () => {
        setRouteBtnLoading(true)
        router.push('/staff/workspace')
    }
    if (!currentQuestion) {
        return (
            <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4">
                <FileQuestion className="h-14 w-14 text-muted-foreground" />
                <h1 className="text-lg font-semibold text-center">No questions in this module yet</h1>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Questions have not been added to this module, so there is nothing to work on here.
                </p>
                <Button onClick={handleRoute} disabled={routeBtnLoading} className="gap-2">
                    {routeBtnLoading && <Loader className="animate-spin p-1" />}
                    Back to Workspace
                </Button>
            </main>
        )
    }
    return (
        <main className="flex min-h-screen min-w-screen flex-row">
            <aside className="sticky top-0 left-0 z-50 hidden sm:flex sm:flex-col w-20 h-screen border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
                <div className="flex-grow flex flex-col justify-between">
                    {/* question queue */}
                    <nav className="flex flex-col my-4 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                        {questionData.map((question: CodeQuestion, index: number) => (
                            <Button
                                key={index}
                                className={`inline-flex items-center justify-center mx-4 transition-colors border bg-transparent text-primary hover:bg-primary/10 ${currentQuestionIndex === index ? 'bg-primary text-white dark:text-white' : ''}`}
                                onClick={() => handleQuestionClick(index)}
                            >
                                <span className='h-6 w-6 p-0.5 font-bold'>
                                    {index + 1}
                                </span>
                            </Button>
                        ))}
                    </nav>

                    <div className="inline-flex flex-col items-center justify-center h-30 w-20 ">
                        <Button
                            className="hover:text-primary bg-transparent hover:bg-transparent border-0 shadow-none text-black dark:text-white  cursor-pointer"
                            size="icon"
                            onClick={toggleFullscreen}>
                            {fullscreen ? (
                                <Minimize className='h-6 w-6 text-primary' />
                            ) : (
                                <Maximize className='h-6 w-6' />
                            )}
                            <span className="sr-only">Toggle fullscreen</span>
                        </Button>
                        <ThemeToggle className="my-4" />
                        <Button className={`inline-flex items-center justify-center p-3 mx-4 my-1 transition-colors bg-primary`} onClick={handleRoute} disabled={routeBtnLoading}>
                            <span className='h-6 w-6'>
                                {
                                    routeBtnLoading ? <Loader className="animate-spin p-1" /> : <LogOut fill='none' />
                                }
                            </span>
                        </Button>
                    </div>
                </div>
            </aside>
            <div className="w-full h-full flex flex-col items-center justify-center flex-grow">
                <div className="h-full w-full flex flex-col mx-4 items-center ">
                    <ResizablePanelGroup
                        direction="horizontal"
                        className="max-w-full max-h-screen rounded-lg border">

                        <ResizablePanel defaultSize={50} minSize={20}>
                            <div className="flex h-screen items-center justify-center">
                                <CodeQuestion Question={currentQuestion} />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={40}>
                            <div className="flex h-screen items-center justify-center">
                                {isSubmitted ? (
                                    <div className='h-screen w-full overflow-y-auto dark:bg-[#1e1e1e] flex justify-center items-center '>
                                        Code Submitted !
                                    </div>
                                ) : (
                                    <div className='flex h-screen items-center justify-center w-full flex-col'
                                    >
                                        <div className='h-[95%] w-full overflow-y-auto dark:bg-[#1e1e1e] '>
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
                                        </div>
                                        <div className='h-[5%] w-full border flex items-center justify-center'>
                                            <div className='flex flex-row w-full items-center justify-start mx-1 p-1 gap-x-2'>
                                                <Button className='bg-green-500 hover:bg-green-400' onClick={RunCode}>
                                                    {executing ? (
                                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Play className='h-6 w-6 mr-2' /> Run
                                                        </>
                                                    )}
                                                </Button>
                                                {samplesuccess &&
                                                    <Button className='bg-green-500 hover:bg-green-400' onClick={RunTestCases}>
                                                        {executingTestcases ? (
                                                            <LoaderIcon className="h-6 w-6 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Play className='h-6 w-6 mr-2' /> Run Test Cases
                                                            </>
                                                        )}
                                                    </Button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                                }
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
            <AlertDialog open={showModal}>
                <AlertDialogContent aria-describedby={undefined}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            <div className='flex flex-row justify-center items-center h-full'>

                                <h2 className='w-1/2 px-2'>Expected Output</h2>
                                <h2 className='w-1/2 px-2'>Program Output</h2>
                            </div>
                        </AlertDialogTitle>
                        {error ?
                            (
                                <div className='bg-gray-700/30 w-full h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                    <pre className='whitespace-pre-wrap break-words overflow-x-auto max-w-full'>
                                        {outputData}
                                    </pre>
                                </div>
                            )
                            : (
                                <div className='flex flex-grow flex-row justify-around items-center w-full py-2'>
                                    <div className='bg-gray-700/30 w-[48%] h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                        <pre className='whitespace-pre-wrap break-words overflow-x-auto max-w-full'>
                                            {currentQuestion.sampleoutput1}
                                        </pre>
                                    </div>
                                    <Separator orientation='vertical' className='mx-2' />
                                    <div className='bg-gray-700/30 w-[48%] h-[150px] rounded-md p-2 font-bold overflow-y-auto overflow-x-hidden'>
                                        {executing ? (
                                            <span className='h-full w-full flex items-center justify-center'>
                                                <LoaderIcon className="h-6 w-6 animate-spin" />
                                            </span>
                                        ) : (

                                            <pre>
                                                {outputData}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            )}
                    </AlertDialogHeader>
                    {!executing && (
                        <AlertDialogFooter>
                            <AlertDialogCancel className='bg-primary hover:bg-primary/80 text-white w-full ' onClick={closeRunModel}>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    )}
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={RunTestModel}>
                <AlertDialogContent aria-describedby={undefined}>
                    <AlertDialogHeader>
                        <div className='flex flex-grow flex-col justify-around items-center w-full py-2 gap-2'>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 1
                                </div>

                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase1Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase1Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 2
                                </div>

                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase2Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase2Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                            <div className='w-full h-1/3 flex flex-row flex-grow justify-center items-center p-2 border border-gray-200 rounded-md'>
                                <div className='w-1/2 flex justify-center items-center'>
                                    Test Case 3
                                </div>
                                <div className='w-1/2 flex justify-center items-center'>
                                    {testcase3Status === "" ? (
                                        <LoaderIcon className="h-6 w-6 animate-spin" />
                                    ) : testcase3Status === "pass" ? (
                                        <>
                                            <Check className='h-6 w-6 mr-2 bg-green-400 rounded-full' /> Passed
                                        </>
                                    ) : (
                                        <>
                                            <X className='h-6 w-6 mr-2 bg-red-500 rounded-full' /> Failed
                                        </>
                                    )
                                    }
                                </div>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    {!executingTestcases && (
                        <AlertDialogFooter>
                            <AlertDialogCancel className='bg-primary hover:bg-primary/80 text-white w-full' onClick={closeTestCaseModel}>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    )}
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
};

export default CodeView;