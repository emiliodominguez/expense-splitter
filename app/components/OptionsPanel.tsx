"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "./Icon";
import type { UserOptions } from "../utils/types";

/**
 * Storage key for user options in localStorage.
 */
const OPTIONS_STORAGE_KEY = "expense-splitter-options";

/**
 * Default user options.
 */
const defaultOptions: UserOptions = {
    showRatEmoji: true,
};

interface OptionsPanelProps {
    isDark: boolean;
    locale: Record<string, string>;
    currentLanguage: "es" | "en";
    toggleThemeAction: () => void;
    toggleLanguageAction: () => void;
}

/**
 * Client component for managing user options.
 * Includes theme, language, and display preferences.
 */
export function OptionsPanel({
    isDark,
    locale,
    currentLanguage,
    toggleThemeAction,
    toggleLanguageAction,
}: OptionsPanelProps): React.ReactNode {
    const [options, setOptions] = useState<UserOptions>(defaultOptions);
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Load options from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(OPTIONS_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as UserOptions;
                setOptions({ ...defaultOptions, ...parsed });
            } catch {
                // Invalid JSON, use defaults
            }
        }
    }, []);

    // Apply rat emoji visibility via CSS
    useEffect(() => {
        document.documentElement.style.setProperty("--rat-emoji-display", options.showRatEmoji ? "inline" : "none");
    }, [options.showRatEmoji]);

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent): void {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    /**
     * Updates a specific option and persists to localStorage.
     */
    function updateOption<K extends keyof UserOptions>(key: K, value: UserOptions[K]): void {
        const newOptions = { ...options, [key]: value };
        setOptions(newOptions);
        localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(newOptions));
    }

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer p-2.5 rounded-xl transition-all duration-200 ${
                    isOpen
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                        : isDark
                            ? "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                            : "bg-gray-900/5 text-gray-600 hover:bg-gray-900/10 hover:text-gray-900"
                }`}
                title={locale.options}
            >
                <Icon name="Settings" className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl p-4 z-50 ${
                        isDark
                            ? "bg-gray-800 border border-gray-700/50"
                            : "bg-white border border-gray-200/50 shadow-gray-200/50"
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {locale.options}
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-400"
                            }`}
                        >
                            <Icon name="Error" className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Theme Toggle */}
                        <div
                            className={`flex items-center justify-between p-3 rounded-xl ${
                                isDark ? "bg-gray-700/50" : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-amber-100 text-amber-600"}`}>
                                    <Icon name={isDark ? "Moon" : "Sun"} className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                    {locale.theme}
                                </span>
                            </div>
                            <form action={toggleThemeAction}>
                                <button
                                    type="submit"
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                        isDark ? "bg-violet-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                            isDark ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                    />
                                </button>
                            </form>
                        </div>

                        {/* Language Toggle */}
                        <div
                            className={`flex items-center justify-between p-3 rounded-xl ${
                                isDark ? "bg-gray-700/50" : "bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                                    <Icon name="World" className="w-4 h-4" />
                                </div>
                                <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                    {locale.language}
                                </span>
                            </div>
                            <form action={toggleLanguageAction}>
                                <button
                                    type="submit"
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        isDark
                                            ? "bg-gray-600 text-white hover:bg-gray-500"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {currentLanguage.toUpperCase()}
                                </button>
                            </form>
                        </div>

                        {/* Rat Emoji Toggle */}
                        <div
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
                                isDark ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => updateOption("showRatEmoji", !options.showRatEmoji)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg text-base ${isDark ? "bg-gray-600" : "bg-gray-200"}`}>
                                    🐀
                                </div>
                                <span className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                    {locale.showRatEmoji}
                                </span>
                            </div>
                            <div
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                    options.showRatEmoji ? "bg-violet-500" : isDark ? "bg-gray-600" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        options.showRatEmoji ? "translate-x-5" : "translate-x-0.5"
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
