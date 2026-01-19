import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { State } from "../../utils/types";

/**
 * Analysis types supported by the AI endpoint.
 */
type AnalysisType = "settlement" | "patterns" | "insights";

/**
 * Request body structure for analysis endpoint.
 */
interface AnalysisRequest {
    state: State;
    analysisType: AnalysisType;
    language: "es" | "en";
}

/**
 * Schema for structured AI analysis response.
 */
const analysisSchema = z.object({
    summary: z.string().describe("A brief 1-2 sentence summary of the analysis"),
    points: z.array(
        z.object({
            title: z.string().describe("Short title for this point"),
            description: z.string().describe("Detailed explanation"),
            type: z.enum(["tip", "observation", "action", "warning"]).describe("Type of point"),
        })
    ).describe("List of key points from the analysis"),
    recommendation: z.string().optional().describe("Main recommended action, if applicable"),
});

/**
 * Builds the prompt for the AI based on analysis type.
 */
function buildPrompt(state: State, type: AnalysisType, language: string): string {
    const langContext = language === "es" ? "Responde en español." : "Respond in English.";

    // Build expenses summary
    const expensesSummary = state.expenses
        .map((e) => {
            const groupName = e.groupId
                ? state.groups.find((g) => g.id === e.groupId)?.name || "Unknown group"
                : "Shared";
            return `${e.person}: $${e.amount.toFixed(2)} (${groupName})`;
        })
        .join("\n");

    // Build debts summary
    const debtsSummary =
        state.debts
            ?.map(
                (d) =>
                    `${d.person} owes ${d.creditor}: $${d.amount.toFixed(2)}${d.settled ? " (settled)" : ""}`
            )
            .join("\n") || "No debts";

    // Build groups summary
    const groupsSummary =
        state.groups.length > 0
            ? state.groups.map((g) => `${g.name}: ${g.participants.join(", ")}`).join("\n")
            : "No groups defined";

    const prompts: Record<AnalysisType, string> = {
        settlement: `
${langContext}
Analyze this expense splitting situation and suggest the optimal settlement strategy.

Expenses:
${expensesSummary}

Groups defined:
${groupsSummary}

Current debts:
${debtsSummary}

Provide brief, actionable advice on how to settle these debts efficiently.
Consider if there are simpler ways to settle (e.g., chain payments where A pays B, B pays C instead of A paying both).
        `.trim(),

        patterns: `
${langContext}
Analyze spending patterns in this group expense data.

Expenses:
${expensesSummary}

Groups defined:
${groupsSummary}

Identify patterns such as:
- Who typically pays the most/least
- Balance of contributions
- Usage patterns across different groups
- Any notable trends
        `.trim(),

        insights: `
${langContext}
Provide helpful insights about this expense splitting scenario.

Expenses:
${expensesSummary}

Groups defined:
${groupsSummary}

Debts:
${debtsSummary}

Give 2-3 brief tips or observations that might help the group manage shared expenses better.
Focus on practical suggestions.
        `.trim(),
    };

    return prompts[type];
}

/**
 * API route for AI-powered expense analysis using Vercel AI SDK with Google Gemini.
 * This feature is OPTIONAL - the app works without AI by default.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "AI not configured. Set GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
            { status: 503 }
        );
    }

    try {
        const body: AnalysisRequest = await request.json();
        const { state, analysisType, language } = body;

        if (!state.expenses.length) {
            return NextResponse.json({ error: "No expenses to analyze" }, { status: 400 });
        }

        const prompt = buildPrompt(state, analysisType, language);

        // Use Vercel AI SDK with Google Gemini for structured output
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: analysisSchema,
            prompt,
        });

        return NextResponse.json({ analysis: object });
    } catch (error) {
        console.error("Analysis API error:", error);
        return NextResponse.json(
            { error: "Failed to analyze expenses. Please try again." },
            { status: 500 }
        );
    }
}
