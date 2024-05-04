export interface Expense {
    person: string;
    amount: number;
}

export interface Debt extends Expense {
    creditor?: string;
}

export function calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((acc, expense) => (acc += expense.amount), 0);
}

export function splitExpensesEqually(expenses: Expense[]): Expense[] {
    const totalExpenses = calculateTotalExpenses(expenses);
    const peopleCount = expenses.length;
    const equalShare = totalExpenses / peopleCount;

    return expenses.map((expense) => ({
        person: expense.person,
        amount: expense.amount - equalShare,
    }));
}

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
