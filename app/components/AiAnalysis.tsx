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
 * Structured analysis response from the AI (patterns/insights).
 */
interface GeneralAnalysisResponse {
    summary: string;
    points: Array<{
        title: string;
        description: string;
        type: "tip" | "observation" | "action" | "warning";
    }>;
    recommendation?: string;
}

/**
 * Settlement analysis response - optimized payment list.
 */
interface SettlementResponse {
    payments: Array<{
        from: string;
        to: string;
        amount: number;
    }>;
    totalTransactions: number;
    savings?: string;
}

type AnalysisResponse =
    | { type: "general"; analysis: GeneralAnalysisResponse }
    | { type: "settlement"; analysis: SettlementResponse };

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

            setAnalysis({ type: data.type, analysis: data.analysis });
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
            className={`rounded-2xl shadow-xl p-6 sm:p-8 mt-8 border backdrop-blur-sm transition-all duration-300 ${
                isDark
                    ? "bg-gray-800/80 border-gray-700/50 shadow-gray-900/50"
                    : "bg-white/80 border-gray-200/50 shadow-gray-200/50"
            }`}
        >
            <h2
                className={`text-xl font-bold mb-6 flex items-center gap-3 ${
                    isDark ? "text-white" : "text-gray-900"
                }`}
            >
                <div className={`p-2 rounded-xl ${isDark ? "bg-violet-500/20" : "bg-violet-100"}`}>
                    <Icon name="Sparkles" className="w-5 h-5 text-violet-500" />
                </div>
                {locale.aiAnalysis}
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => analyze("settlement")}
                    disabled={loading}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                        isDark
                            ? "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                            : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    }`}
                >
                    {locale.suggestSettlement}
                </button>
                <button
                    onClick={() => analyze("patterns")}
                    disabled={loading}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                        isDark
                            ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                >
                    {locale.analyzePatterns}
                </button>
                <button
                    onClick={() => analyze("insights")}
                    disabled={loading}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                        isDark
                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
                >
                    {locale.getInsights}
                </button>
            </div>

            {loading && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? "bg-gray-900/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    {locale.analyzing}
                </div>
            )}

            {error && (
                <div
                    className={`p-4 rounded-xl ${
                        isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600"
                    }`}
                >
                    {error}
                </div>
            )}

            {analysis && !loading && analysis.type === "settlement" && (
                <div className="space-y-4">
                    {/* Optimized Payment List */}
                    <div className="space-y-2">
                        {analysis.analysis.payments.map((payment, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg flex items-center justify-between ${
                                    isDark ? "bg-purple-900/30" : "bg-purple-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                            isDark ? "bg-purple-600 text-white" : "bg-purple-500 text-white"
                                        }`}
                                    >
                                        {payment.from.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={isDark ? "text-gray-200" : "text-gray-700"}>
                                        <span className="font-medium">{payment.from}</span>
                                        <span className="mx-2">→</span>
                                        <span className="font-medium">{payment.to}</span>
                                    </div>
                                </div>
                                <span
                                    className={`font-bold px-3 py-1 rounded ${
                                        isDark ? "bg-purple-800 text-purple-200" : "bg-purple-200 text-purple-800"
                                    }`}
                                >
                                    ${payment.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div
                        className={`text-sm text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                        {analysis.analysis.totalTransactions} {locale.transactions || "transactions"}
                        {analysis.analysis.savings && ` · ${analysis.analysis.savings}`}
                    </div>
                </div>
            )}

            {analysis && !loading && analysis.type === "general" && (
                <div className="space-y-4">
                    {/* Summary */}
                    <div
                        className={`p-4 rounded-lg ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                        <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            {analysis.analysis.summary}
                        </p>
                    </div>

                    {/* Points */}
                    <div className="space-y-2">
                        {analysis.analysis.points.map((point, index) => {
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
                    {analysis.analysis.recommendation && (
                        <div
                            className={`p-4 rounded-lg border-2 border-dashed ${
                                isDark
                                    ? "border-purple-700 bg-purple-900/20 text-purple-200"
                                    : "border-purple-300 bg-purple-50 text-purple-800"
                            }`}
                        >
                            <p className="font-medium flex items-center gap-2">
                                <span>🎯</span>
                                {analysis.analysis.recommendation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
