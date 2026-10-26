import { db } from "@/lib/db";
import { json, fail, preflight, authGuard } from "@/lib/desktop-auth";
import { isEnrolledInModule } from "@/lib/desktop-helpers";

/**
 * POST /api/desktop/run — server-side code-execution proxy.
 *
 * The web client calls the external judge (lambda) directly with the hidden
 * test cases; for the desktop client we proxy server-side so:
 *  - the client never needs the judge URL, and
 *  - expected outputs of hidden test cases never leave the server.
 *
 * Body: { questionId, code, mode: "sample" | "tests", moduleId?, assessmentId? }
 *  - practice questions → pass moduleId (enrollment checked on the module)
 *  - assessment questions → pass assessmentId (active attempt checked)
 *  sample → runs against sampleinput1/sampleoutput1  (output is returned)
 *  tests  → runs the 3 hidden test cases             (only pass/fail + program
 *           output is returned, never the expected output)
 */
const LAMBDA_TIMEOUT_MS = 30_000;

export async function POST(req: Request) {
  const { ctx, response } = await authGuard(req);
  if (!ctx) return response;
  const uid = ctx.user.id;

  const body = await req.json().catch(() => null);
  const questionId = String(body?.questionId ?? "");
  const moduleId = String(body?.moduleId ?? "");
  const assessmentId = String(body?.assessmentId ?? "");
  const code = String(body?.code ?? "");
  const mode = String(body?.mode ?? "sample");

  if (!code.trim()) return fail(400, "Code is empty");
  if (!questionId) return fail(400, "'questionId' is required");
  if (!moduleId && !assessmentId)
    return fail(400, "Provide 'moduleId' (practice) or 'assessmentId' (assessment)");

  let question: {
    lang: string;
    sampleinput1: string;
    sampleoutput1: string;
    input1: string;
    input2: string;
    input3: string;
    output1: string;
    output2: string;
    output3: string;
  } | null = null;

  if (assessmentId) {
    // Assessment question: require an existing attempt by this student
    const attempt = await db.userAssessmentData.findFirst({
      where: { userId: uid, assessmentId },
    });
    if (!attempt)
      return fail(403, "No active attempt for this assessment");
    question = await db.codeQuestion.findFirst({
      where: { id: questionId, assessmentsId: assessmentId },
    });
  } else {
    const { ok, module: mod } = await isEnrolledInModule(uid, moduleId);
    if (!mod) return fail(404, "Module not found");
    if (!ok) return fail(403, "You are not enrolled in this module's course");
    question = await db.codeQuestion.findFirst({
      where: { id: questionId, moduleId },
    });
  }

  if (!question) return fail(404, "Code question not found");

  const callLambda = async (url: string, payload: unknown) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LAMBDA_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Judge responded ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    if (mode === "sample") {
      const base = process.env.NEXT_PUBLIC_LAMBDA_URL;
      if (!base) {
        return fail(
          503,
          "Code execution service is not configured on this server. Ask your admin to set NEXT_PUBLIC_LAMBDA_URL."
        );
      }
      const res = await callLambda(`${base}/${question.lang}`, {
        code,
        input: question.sampleinput1,
        expected_output: question.sampleoutput1,
      });
      const d = res?.data ?? {};
      return json({
        mode,
        compileMessage: d.compileMessage ?? null,
        output: d.output ?? null,
        passed: d.compileMessage === "Success",
      });
    }

    // mode === "tests"
    const base = process.env.NEXT_PUBLIC_LAMBDA_MULTI_URL;
    if (!base) {
      return fail(
        503,
        "Test-case execution service is not configured on this server. Ask your admin to set NEXT_PUBLIC_LAMBDA_MULTI_URL."
      );
    }
    const res = await callLambda(`${base}/${question.lang}`, {
      code,
      input1: question.input1,
      expected_output1: question.output1,
      input2: question.input2,
      expected_output2: question.output2,
      input3: question.input3,
      expected_output3: question.output3,
    });
    const d = res?.data ?? {};
    const map = (v: string) => (v === "Success" ? "pass" : v === "Error" ? "error" : "fail");
    return json({
      mode,
      compileMessage: d.compileMessage ?? null,
      testcase1status: map(d.test_case1),
      testcase2status: map(d.test_case2),
      testcase3status: map(d.test_case3),
      output1: d.output1 ?? d.output ?? null,
      output2: d.output2 ?? null,
      output3: d.output3 ?? null,
      passedCount: [d.test_case1, d.test_case2, d.test_case3].filter(
        (v: string) => v === "Success"
      ).length,
    });
  } catch (e) {
    console.error("[desktop/run]", e);
    return fail(502, "Code execution failed — judge unreachable or timed out");
  }
}

export async function OPTIONS() {
  return preflight();
}
