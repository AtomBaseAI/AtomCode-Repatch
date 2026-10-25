interface UserAggregate {
    userId: string;
    rollnumber: string | null;
    name: string | null;
    totalModules: number;
    totalScore: number;
    mcqScore: number;
    codeScore: number;
    totalTime: number;
    totalErrors: number;
    totalCompiles: number;
    rank?: number;
}
interface ModuleData {
    modulename: string;
    mcqscore: number;
    codescore: number;
    totalscore: number;
    errors: number;
    compiles: number;
    time: number;
    maxscore: number;
}

interface StudentData {
    studentname: string | null;
    rollnumber: string | null;
    department: string | null;
    batch: string | null;
    section: string | null;
    email: string;
    completionpercentage: number;
    moduledata: ModuleData[];
}

interface CourseCompletionData {
    coursename: string;
    totalmodules: number;
    data: StudentData[];
}