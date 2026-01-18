"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import type { State, ShareableState } from "../utils/types";

/**
 * Maximum URL length for sharing (conservative for browser compatibility).
 */
const MAX_URL_LENGTH = 2000;

interface ShareButtonProps {
    state: State;
    isDark: boolean;
    locale: Record<string, string>;
}

/**
 * Converts state to a minimal shareable format.
 * Uses abbreviated keys to minimize URL length.
 */
function stateToShareable(state: State): ShareableState {
    return {
        e: state.expenses.map((exp) => ({
            p: exp.person,
            a: exp.amount,
            ...(exp.groupId ? { g: exp.groupId } : {}),
        })),
        ...(state.groups.length > 0
            ? {
                  gr: state.groups.map((g) => ({
                      i: g.id,
                      n: g.name,
                      p: g.participants,
                  })),
              }
            : {}),
    };
}

/**
 * Encodes state to a URL-safe base64 string.
 */
function encodeStateForUrl(state: State): string {
    const shareable = stateToShareable(state);
    const json = JSON.stringify(shareable);

    // Use base64url encoding (URL-safe)
    const encoded = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    return encoded;
}

/**
 * Generates a shareable URL with encoded state.
 */
function generateShareUrl(state: State): string | null {
    const encoded = encodeStateForUrl(state);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}?data=${encoded}&view=true`;

    if (url.length > MAX_URL_LENGTH) {
        return null;
    }

    return url;
}

/**
 * Client component for sharing expense data via URL.
 */
export function ShareButton({ state, isDark, locale }: ShareButtonProps): React.ReactNode {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Copies the share URL to clipboard.
     */
    async function handleShare(): Promise<void> {
        const url = generateShareUrl(state);

        if (!url) {
            setError(locale.dataTooLarge);
            setTimeout(() => setError(null), 3000);
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="relative">
            <button
                onClick={handleShare}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                    copied
                        ? "bg-green-600 text-white border-green-600"
                        : isDark
                            ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
                title={locale.share}
            >
                {copied ? (
                    <>
                        <Icon name="Check" className="w-4 h-4" />
                        {locale.linkCopied}
                    </>
                ) : (
                    <>
                        <Icon name="Share" className="w-4 h-4" />
                        {locale.share}
                    </>
                )}
            </button>

            {error && (
                <div
                    className={`absolute right-0 mt-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                        isDark ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
                    }`}
                >
                    {error}
                </div>
            )}
        </div>
    );
}
