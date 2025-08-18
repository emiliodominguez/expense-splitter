import type { State, Expense, Debt } from "./types";

/**
 * Intl.NumberFormat instance for formatting prices.
 */
export const priceFormatter = new Intl.NumberFormat();

/**
 * The default state for the application.
 */
export const defaultState: State = {
    expenses: [],
    debts: null,
    language: "es",
    theme: "dark",
};

/**
 * Calculates the total expenses from an array of expenses.
 * @param expenses - An array of expenses.
 * @returns The total amount of expenses.
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((acc, expense) => (acc += expense.amount), 0);
}

/**
 * Groups expenses by person and calculates their total.
 * @param expenses - An array of expenses.
 * @returns A map of person to their total expenses.
 */
export function groupExpensesByPerson(expenses: Expense[]): Map<string, number> {
    return expenses.reduce((acc, expense) => {
        const currentAmount = acc.get(expense.person) || 0;

        acc.set(expense.person, currentAmount + expense.amount);

        return acc;
    }, new Map<string, number>());
}

/**
 * Splits expenses equally among people.
 * @param expenses - An array of expenses.
 * @returns An array of expenses with amounts adjusted for equal splitting.
 */
export function splitExpensesEqually(expenses: Expense[]): Expense[] {
    if (!expenses.length) return [];

    const groupedExpenses = groupExpensesByPerson(expenses);
    const totalExpenses = calculateTotalExpenses(expenses);
    const peopleCount = groupedExpenses.size;
    const equalShare = totalExpenses / peopleCount;

    return Array.from(groupedExpenses.entries()).map(([person, amount]) => ({
        person,
        amount: amount - equalShare,
    }));
}

/**
 * Organizes payments to settle debts efficiently using a greedy algorithm.
 * @param balances - An array of balances (positive = owed money, negative = owes money).
 * @returns An array of debts representing pending transactions.
 */
export function organizePayments(balances: Expense[]): Debt[] {
    if (!balances.length) return [];

    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = balances.filter((b) => b.amount < 0).map((b) => ({ ...b, amount: Math.abs(b.amount) }));
    const creditors = balances.filter((b) => b.amount > 0).map((b) => ({ ...b }));

    // Skip people with zero balance
    if (!debtors.length || !creditors.length) return [];

    const transactions: Debt[] = [];

    // Sort for optimal pairing (largest debts first)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
        const debtor = debtors[debtorIndex];
        const creditor = creditors[creditorIndex];

        const transferAmount = Math.min(debtor.amount, creditor.amount);

        if (transferAmount > 0) {
            transactions.push({
                person: debtor.person,
                amount: transferAmount,
                creditor: creditor.person,
            });

            // Update remaining amounts
            debtor.amount -= transferAmount;
            creditor.amount -= transferAmount;
        }

        // Move to next debtor/creditor if current one is settled
        if (debtor.amount === 0) debtorIndex++;

        if (creditor.amount === 0) creditorIndex++;
    }

    return transactions;
}
