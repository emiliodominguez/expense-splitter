"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";
import type { State, ExpenseGroup } from "../utils/types";

interface GroupManagerProps {
    state: State;
    isDark: boolean;
    locale: Record<string, string>;
    uniquePeople: string[];
}

/**
 * Generates a unique ID for groups.
 */
function generateGroupId(): string {
    return `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Client component for managing expense groups.
 * Groups define subsets of participants who share specific expenses.
 */
export function GroupManager({ state, isDark, locale, uniquePeople }: GroupManagerProps): React.ReactNode {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ExpenseGroup | null>(null);
    const [groupName, setGroupName] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [newParticipantName, setNewParticipantName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when adding a new participant
    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    /**
     * Resets the form state.
     */
    function resetForm(): void {
        setGroupName("");
        setSelectedParticipants([]);
        setNewParticipantName("");
        setIsCreating(false);
        setEditingGroup(null);
    }

    /**
     * Handles participant selection toggle.
     */
    function toggleParticipant(person: string): void {
        setSelectedParticipants((prev) =>
            prev.includes(person) ? prev.filter((p) => p !== person) : [...prev, person]
        );
    }

    /**
     * Adds a new participant by name.
     */
    function addParticipant(): void {
        const name = newParticipantName.trim();
        if (name && !selectedParticipants.includes(name)) {
            setSelectedParticipants((prev) => [...prev, name]);
            setNewParticipantName("");
        }
    }

    /**
     * Handles key press in participant input.
     */
    function handleParticipantKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === "Enter") {
            e.preventDefault();
            addParticipant();
        }
    }

    /**
     * Removes a participant from the list.
     */
    function removeParticipant(person: string): void {
        setSelectedParticipants((prev) => prev.filter((p) => p !== person));
    }

    /**
     * Submits the group form (create or update).
     */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if (!groupName.trim() || selectedParticipants.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append("action", editingGroup ? "update" : "create");
        formData.append("id", editingGroup?.id || generateGroupId());
        formData.append("name", groupName.trim());
        formData.append("participants", JSON.stringify(selectedParticipants));

        // Submit via fetch to trigger server action
        await fetch("/api/groups", {
            method: "POST",
            body: formData,
        });

        resetForm();
        // Force page refresh to get updated state
        window.location.reload();
    }

    /**
     * Deletes a group.
     */
    async function handleDelete(groupId: string): Promise<void> {
        const formData = new FormData();
        formData.append("action", "delete");
        formData.append("id", groupId);

        await fetch("/api/groups", {
            method: "POST",
            body: formData,
        });

        window.location.reload();
    }

    /**
     * Opens the edit form for a group.
     */
    function startEditing(group: ExpenseGroup): void {
        setEditingGroup(group);
        setGroupName(group.name);
        setSelectedParticipants(group.participants);
        setIsCreating(true);
    }

    // Get suggested people from existing expenses that aren't already selected
    const suggestedPeople = uniquePeople.filter((p) => !selectedParticipants.includes(p));

    return (
        <div
            className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border backdrop-blur-sm transition-all duration-300 ${
                isDark
                    ? "bg-gray-800/80 border-gray-700/50 shadow-gray-900/50"
                    : "bg-white/80 border-gray-200/50 shadow-gray-200/50"
            }`}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between"
            >
                <h2 className={`text-xl font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    <div className={`p-2 rounded-xl ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"}`}>
                        <Icon name="Group" className="w-5 h-5" />
                    </div>
                    {locale.groups}
                    {state.groups.length > 0 && (
                        <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                            }`}
                        >
                            {state.groups.length}
                        </span>
                    )}
                </h2>
                <Icon
                    name="Plus"
                    className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? "rotate-45" : ""} ${
                        isDark ? "text-gray-400" : "text-gray-400"
                    }`}
                />
            </button>

            {isExpanded && (
                <div className="mt-6">
                    {/* Existing Groups */}
                    {state.groups.length > 0 ? (
                        <div className="space-y-3 mb-6">
                            {state.groups.map((group) => (
                                <div
                                    key={group.id}
                                    className={`p-4 rounded-lg border ${
                                        isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {group.name}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditing(group)}
                                                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                                                    isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                                title={locale.editGroup}
                                            >
                                                <Icon name="Settings" className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group.id)}
                                                className={`p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 ${
                                                    isDark ? "text-red-400" : "text-red-500"
                                                }`}
                                                title={locale.deleteGroup}
                                            >
                                                <Icon name="TrashCan" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {group.participants.map((person) => (
                                            <span
                                                key={person}
                                                className={`text-xs px-2 py-1 rounded ${
                                                    isDark ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                {person}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`text-center py-4 mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <p>{locale.noGroups}</p>
                            <p className="text-sm">{locale.noGroupsDescription}</p>
                        </div>
                    )}

                    {/* Create/Edit Form */}
                    {isCreating ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="groupName"
                                    className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                    {locale.groupName}
                                </label>
                                <input
                                    type="text"
                                    id="groupName"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder={locale.groupNamePlaceholder}
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {locale.participants}
                                </label>

                                {/* Selected participants */}
                                {selectedParticipants.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedParticipants.map((person) => (
                                            <span
                                                key={person}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-600 text-white"
                                            >
                                                {person}
                                                <button
                                                    type="button"
                                                    onClick={() => removeParticipant(person)}
                                                    className="ml-1 hover:bg-green-700 rounded-full p-0.5"
                                                >
                                                    <Icon name="Error" className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Add participant input */}
                                <div className="flex gap-2 mb-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newParticipantName}
                                        onChange={(e) => setNewParticipantName(e.target.value)}
                                        onKeyDown={handleParticipantKeyDown}
                                        placeholder={locale.addParticipantPlaceholder}
                                        className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                            isDark
                                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={addParticipant}
                                        disabled={!newParticipantName.trim()}
                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                    >
                                        <Icon name="Plus" className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Suggested participants from existing expenses */}
                                {suggestedPeople.length > 0 && (
                                    <div>
                                        <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {locale.suggestedParticipants}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedPeople.map((person) => (
                                                <button
                                                    key={person}
                                                    type="button"
                                                    onClick={() => toggleParticipant(person)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                        isDark
                                                            ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                    }`}
                                                >
                                                    + {person}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={!groupName.trim() || selectedParticipants.length === 0}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                                >
                                    {editingGroup ? locale.saveGroup : locale.createGroup}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isDark
                                            ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {locale.cancel}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className={`w-full py-3 px-4 rounded-lg font-medium border-2 border-dashed transition-colors ${
                                isDark
                                    ? "border-gray-600 text-gray-400 hover:border-green-500 hover:text-green-400"
                                    : "border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600"
                            }`}
                        >
                            <Icon name="Plus" className="w-4 h-4 inline-block mr-2" />
                            {locale.addGroup}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
