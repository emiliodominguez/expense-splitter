"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icon";
import type { State } from "../utils/types";

interface AiAnalysisProps {
    state: State;
    isDark: boolean;
    locale: Record<string, string>;
}

type AnalysisType = "settlement" | "patterns" | "insights";

/**
 * Structured analysis response from the AI.
 */
interface AnalysisResponse {
    summary: string;
    points: Array<{
        title: string;
        description: string;
        type: "tip" | "observation" | "action" | "warning";
    }>;
    recommendation?: string;
}

/**
 * Icon and color mapping for point types.
 */
const pointTypeStyles: Record<string, { icon: string; color: string; darkColor: string }> = {
    tip: { icon: "💡", color: "bg-yellow-100 text-yellow-800", darkColor: "bg-yellow-900/30 text-yellow-200" },
    observation: { icon: "👁️", color: "bg-blue-100 text-blue-800", darkColor: "bg-blue-900/30 text-blue-200" },
    action: { icon: "✅", color: "bg-green-100 text-green-800", darkColor: "bg-green-900/30 text-green-200" },
    warning: { icon: "⚠️", color: "bg-red-100 text-red-800", darkColor: "bg-red-900/30 text-red-200" },
};

/**
 * Client component for AI-powered expense analysis.
 * This feature is OPTIONAL - only shows if AI API responds successfully.
 */
export function AiAnalysis({ state, isDark, locale }: AiAnalysisProps): React.ReactNode {
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    // Check if AI is available on mount
    useEffect(() => {
        async function checkAvailability(): Promise<void> {
            try {
                const response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        state: { expenses: [], groups: [], debts: null },
                        analysisType: "insights",
                        language: "en",
                    }),
                });

                // 503 means AI is not configured, which is fine
                // 400 means no expenses (expected), so AI is available
                setIsAvailable(response.status !== 503);
            } catch {
                setIsAvailable(false);
            }
        }

        checkAvailability();
    }, []);

    /**
     * Requests AI analysis from the API.
     */
    async function analyze(type: AnalysisType): Promise<void> {
        setLoading(true);
        setError("");
        setAnalysis(null);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    state,
                    analysisType: type,
                    language: state.language,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed");
            }

            setAnalysis(data.analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : locale.analysisError);
        } finally {
            setLoading(false);
        }
    }

    // Don't render if no expenses or AI is not available
    if (!state.expenses.length || isAvailable === false) {
        return null;
    }

    // Still checking availability
    if (isAvailable === null) {
        return null;
    }

    return (
        <div
            className={`rounded-xl shadow-lg p-6 mt-6 border transition-colors duration-300 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
        >
            <h2
                className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                }`}
            >
                <Icon name="Sparkles" className="w-6 h-6 text-purple-500" />
                {locale.aiAnalysis}
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => analyze("settlement")}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDark
                            ? "bg-purple-900/50 text-purple-200 hover:bg-purple-800"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                >
                    {locale.suggestSettlement}
                </button>
                <button
                    onClick={() => analyze("patterns")}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDark
                            ? "bg-blue-900/50 text-blue-200 hover:bg-blue-800"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                >
                    {locale.analyzePatterns}
                </button>
                <button
                    onClick={() => analyze("insights")}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                        isDark
                            ? "bg-green-900/50 text-green-200 hover:bg-green-800"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                >
                    {locale.getInsights}
                </button>
            </div>

            {loading && (
                <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {locale.analyzing}
                </div>
            )}

            {error && (
                <div
                    className={`p-4 rounded-lg ${
                        isDark ? "bg-red-900/20 text-red-200" : "bg-red-50 text-red-700"
                    }`}
                >
                    {error}
                </div>
            )}

            {analysis && !loading && (
                <div className="space-y-4">
                    {/* Summary */}
                    <div
                        className={`p-4 rounded-lg ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                        <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            {analysis.summary}
                        </p>
                    </div>

                    {/* Points */}
                    <div className="space-y-2">
                        {analysis.points.map((point, index) => {
                            const style = pointTypeStyles[point.type] || pointTypeStyles.observation;
                            return (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${isDark ? style.darkColor : style.color}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg">{style.icon}</span>
                                        <div>
                                            <p className="font-medium">{point.title}</p>
                                            <p className="text-sm opacity-90">{point.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recommendation */}
                    {analysis.recommendation && (
                        <div
                            className={`p-4 rounded-lg border-2 border-dashed ${
                                isDark
                                    ? "border-purple-700 bg-purple-900/20 text-purple-200"
                                    : "border-purple-300 bg-purple-50 text-purple-800"
                            }`}
                        >
                            <p className="font-medium flex items-center gap-2">
                                <span>🎯</span>
                                {analysis.recommendation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
