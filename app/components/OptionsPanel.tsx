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
}

/**
 * Client component for managing user options.
 * Options are persisted in localStorage.
 */
export function OptionsPanel({ isDark, locale }: OptionsPanelProps): React.ReactNode {
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
        document.documentElement.style.setProperty(
            "--rat-emoji-display",
            options.showRatEmoji ? "inline" : "none"
        );
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
                className={`cursor-pointer p-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                    isDark
                        ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                }`}
                title={locale.options}
            >
                <Icon name="Settings" className="w-4 h-4" />
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg border p-4 z-50 ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {locale.options}
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            <Icon name="Error" className="w-4 h-4" />
                        </button>
                    </div>

                    <label className={`flex items-center gap-3 cursor-pointer ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                        <input
                            type="checkbox"
                            checked={options.showRatEmoji}
                            onChange={(e) => updateOption("showRatEmoji", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{locale.showRatEmoji}</span>
                        <span className="ml-auto">🐀</span>
                    </label>
                </div>
            )}
        </div>
    );
}
