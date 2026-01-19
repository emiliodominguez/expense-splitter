import { NextRequest, NextResponse } from "next/server";
import { getState, setState } from "../../actions";
import { splitExpensesByGroups, organizePayments } from "../../utils/helpers";
import type { ExpenseGroup } from "../../utils/types";

/**
 * API route for managing expense groups.
 * Supports create, update, and delete operations.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const action = formData.get("action") as string;
        const id = formData.get("id") as string;

        const currentState = await getState();

        if (action === "create" || action === "update") {
            const name = formData.get("name") as string;
            const participantsJson = formData.get("participants") as string;
            const participants = JSON.parse(participantsJson) as string[];

            const newGroup: ExpenseGroup = {
                id,
                name,
                participants,
            };

            let updatedGroups: ExpenseGroup[];

            if (action === "update") {
                // Update existing group
                updatedGroups = currentState.groups.map((g) => (g.id === id ? newGroup : g));
            } else {
                // Add new group
                updatedGroups = [...currentState.groups, newGroup];
            }

            // Recalculate debts with new groups
            const splitExpenses = splitExpensesByGroups(currentState.expenses, updatedGroups);
            const organizedDebts = organizePayments(splitExpenses);

            await setState({
                groups: updatedGroups,
                debts: organizedDebts,
            });

            return NextResponse.json({ success: true });
        }

        if (action === "delete") {
            // Remove group and clear groupId from expenses that used it
            const updatedGroups = currentState.groups.filter((g) => g.id !== id);
            const updatedExpenses = currentState.expenses.map((e) =>
                e.groupId === id ? { ...e, groupId: undefined } : e
            );

            // Recalculate debts
            const splitExpenses = splitExpensesByGroups(updatedExpenses, updatedGroups);
            const organizedDebts = organizePayments(splitExpenses);

            await setState({
                groups: updatedGroups,
                expenses: updatedExpenses,
                debts: organizedDebts,
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Groups API error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
