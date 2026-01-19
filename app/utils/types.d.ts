/**
 * Represents an expense group for splitting costs among specific participants.
 * Groups allow flexible expense allocation for various scenarios like activities,
 * dietary preferences, rentals, or any situation where costs should be split
 * among a subset of people.
 */
export interface ExpenseGroup {
    /** Unique identifier for the group */
    id: string;
    /** Display name of the group (e.g., "Went kayaking", "Meat eaters") */
    name: string;
    /** List of participant names who share expenses in this group */
    participants: string[];
}

/**
 * Represents a single expense entry.
 */
export interface Expense {
    /** Unique identifier for the expense */
    id: string;
    /** Name of the person who paid */
    person: string;
    /** Amount paid */
    amount: number;
    /** Optional group ID - if not set, expense is shared by everyone */
    groupId?: string;
}

/**
 * Represents a debt from one person to another.
 */
export interface Debt {
    /** Person who owes money */
    person: string;
    /** Amount owed */
    amount: number;
    /** Person who is owed money */
    creditor: string;
    /** Whether this debt has been paid */
    settled?: boolean;
    /** Timestamp when the debt was settled */
    settledAt?: number;
}

/**
 * User preferences stored in localStorage.
 * These settings are client-side only and persist across sessions.
 */
export interface UserOptions {
    /** Whether to show the rat emoji for $0 contributions */
    showRatEmoji: boolean;
}

/**
 * Application state stored in cookies.
 * This is the main data structure persisted server-side.
 */
export interface State {
    /** Schema version for migrations (current: 2) */
    version: number;
    /** List of all expenses */
    expenses: Expense[];
    /** Defined expense groups for custom splitting */
    groups: ExpenseGroup[];
    /** Calculated debts (null if not yet calculated) */
    debts: Debt[] | null;
    /** UI language */
    language: "es" | "en";
    /** UI theme */
    theme: "dark" | "light";
}

/**
 * Minimal shareable state for URL encoding.
 * Uses abbreviated keys to reduce URL length.
 */
export interface ShareableState {
    /** Expenses array (abbreviated) */
    e: Array<{
        /** Person name */
        p: string;
        /** Amount */
        a: number;
        /** Group ID (optional) */
        g?: string;
    }>;
    /** Groups array (optional, abbreviated) */
    gr?: Array<{
        /** Group ID */
        i: string;
        /** Group name */
        n: string;
        /** Participants */
        p: string[];
    }>;
}
