import { getModuleQuestionsByModuleId } from '@/data/modules';


import CodeView from '@/components/code/code-view';
const CodeMain = async ({ params }: { params: any }) => {
    const { mid, cid } = params;


    const ModuleQuestions = await getModuleQuestionsByModuleId(mid) || [];

    return (
        <>
            <CodeView questions={ModuleQuestions} mid={mid} cid={cid} />
        </>
    )
}

export default CodeMain