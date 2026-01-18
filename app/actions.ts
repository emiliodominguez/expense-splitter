"use server";

import { cookies } from "next/headers";
import { defaultState } from "./utils/helpers";
import type { State, Expense } from "./utils/types";

/**
 * Cookie ID for storing the application state.
 */
const stateCookieId = "EXPENSES_SPLITTER_STATE";

/**
 * Current schema version for state migrations.
 */
const CURRENT_VERSION = 2;

/**
 * Generates a unique ID for expenses.
 * @returns A unique string identifier
 */
export function generateExpenseId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Migrates state from older versions to the current version.
 * Handles backward compatibility with legacy data structures.
 * @param state - The potentially outdated state object
 * @returns The migrated state with current schema
 */
function migrateState(state: Partial<State>): State {
    const version = state.version || 1;
    const migrated = { ...state };

    if (version < 2) {
        // Migration from v1 to v2:
        // - Add IDs to existing expenses
        // - Initialize groups array
        // - Add version field
        migrated.expenses = (migrated.expenses || []).map((exp, index) => ({
            ...exp,
            id: (exp as Expense).id || `migrated-${index}-${Date.now()}`,
        }));
        migrated.groups = migrated.groups || [];
        migrated.version = CURRENT_VERSION;
    }

    return { ...defaultState, ...migrated } as State;
}

/**
 * Server action to get the state of the application.
 * Automatically migrates legacy state to current schema.
 * @returns The current state of the application
 */
export async function getState(): Promise<State> {
    const requestCookies = await cookies();
    const storedState = requestCookies.get(stateCookieId)?.value || "{}";

    const parsedState = JSON.parse(storedState);
    return migrateState(parsedState);
}

/**
 * Server action to set the state of the application.
 * @param updatedState - The updated state to set (or a function that receives previous state)
 * @returns The new state of the application
 */
export async function setState(updatedState: Partial<State> | ((prev: State) => Partial<State>)): Promise<State> {
    const [requestCookies, currentState] = await Promise.all([cookies(), getState()]);
    const newState = { ...currentState, ...(typeof updatedState === "function" ? updatedState(currentState) : updatedState) };

    requestCookies.set(stateCookieId, JSON.stringify(newState));

    return newState;
}

/**
 * Server action to reset the state of the application.
 * @returns The default state of the application
 */
export async function resetState(): Promise<State> {
    const requestCookies = await cookies();

    requestCookies.delete(stateCookieId);

    return defaultState;
}

/**
 * Server action to mark a debt as settled.
 * @param debtIndex - The index of the debt in the debts array
 * @returns The updated state
 */
export async function settleDebt(debtIndex: number): Promise<State> {
    return setState((prev) => ({
        debts:
            prev.debts?.map((debt, i) =>
                i === debtIndex ? { ...debt, settled: true, settledAt: Date.now() } : debt
            ) || null,
    }));
}

/**
 * Server action to mark a debt as unsettled.
 * @param debtIndex - The index of the debt in the debts array
 * @returns The updated state
 */
export async function unsettleDebt(debtIndex: number): Promise<State> {
    return setState((prev) => ({
        debts:
            prev.debts?.map((debt, i) =>
                i === debtIndex ? { ...debt, settled: false, settledAt: undefined } : debt
            ) || null,
    }));
}
