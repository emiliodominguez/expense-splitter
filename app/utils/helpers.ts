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
 * Splits expenses equally among people.
 * @param expenses - An array of expenses.
 * @returns An array of expenses with amounts adjusted for equal splitting.
 */
export function splitExpensesEqually(expenses: Expense[]): Expense[] {
    const totalExpenses = calculateTotalExpenses(expenses);
    const peopleCount = expenses.length;
    const equalShare = totalExpenses / peopleCount;

    return expenses.map((expense) => ({
        person: expense.person,
        amount: expense.amount - equalShare,
    }));
}

/**
 * Organizes payments to settle debts and credits.
 * @param expenses - An array of expenses including debts and credits.
 * @returns An array of debts representing pending transactions.
 */
export function organizePayments(expenses: Expense[]): Debt[] {
    const debts: Debt[] = [];
    const credits: Debt[] = [];
    const pendingTransactions: Debt[] = [];

    for (const expense of expenses) {
        if (expense.amount > 0) {
            credits.push(expense);
        } else if (expense.amount < 0) {
            debts.push(expense);
        }
    }

    for (const debtor of debts) {
        let remainingDebt = debtor.amount;

        for (const creditor of credits) {
            if (creditor.amount > 0) {
                const amountToTransfer = Math.min(-remainingDebt, creditor.amount);

                if (amountToTransfer <= 0) continue;

                pendingTransactions.push({
                    person: debtor.person,
                    amount: amountToTransfer,
                    creditor: creditor.person,
                });

                remainingDebt += amountToTransfer;
                creditor.amount -= amountToTransfer;
            }
        }
    }

    return pendingTransactions;
}
