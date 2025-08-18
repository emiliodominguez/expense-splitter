"use server";

import { cookies } from "next/headers";
import { defaultState } from "./utils/helpers";
import type { State } from "./utils/types";

/**
 * Cookie ID for storing the application state.
 */
const stateCookieId = "EXPENSES_SPLITTER_STATE";

/**
 * Server action to get the state of the application
 * @returns The current state of the application
 */
export async function getState(): Promise<State> {
    const requestCookies = await cookies();
    const storedState = requestCookies.get(stateCookieId)?.value || "{}";

    return { ...defaultState, ...JSON.parse(storedState) };
}

/**
 * Server action to set the state of the application
 * @param updatedState - The updated state to set
 * @returns The new state of the application
 */
export async function setState(updatedState: Partial<State> | ((prev: State) => Partial<State>)): Promise<State> {
    const [requestCookies, currentState] = await Promise.all([cookies(), getState()]);
    const newState = { ...currentState, ...(typeof updatedState === "function" ? updatedState(currentState) : updatedState) };

    requestCookies.set(stateCookieId, JSON.stringify(newState));

    return newState;
}

/**
 * Server action to reset the state of the application
 * @returns The default state of the application
 */
export async function resetState(): Promise<State> {
    const requestCookies = await cookies();

    requestCookies.delete(stateCookieId);

    return defaultState;
}
