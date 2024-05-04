export interface Expense {
    person: string;
    amount: number;
}

export interface Debt extends Expense {
    creditor?: string;
}

export function calculateTotalExpenses(expenses: Expense[]): number {
    return expenses.reduce((acc, expense) => (acc += Number(expense.amount)), 0);
}

export function splitExpensesEqually(expenses: Expense[]): Expense[] {
    const totalExpenses = calculateTotalExpenses(expenses);
    const peopleCount = expenses.length;
    const equalShare = totalExpenses / peopleCount;

    return expenses.reduce<Expense[]>((acc, expense) => {
        const difference = expense.amount - equalShare;

        acc.push({ person: expense.person, amount: difference });

        return acc;
    }, []);
}

export function organizePayments(paymentDetails: Expense[]): Debt[] {
    const debts: Expense[] = [];
    const credits: Expense[] = [];

    for (const payment of paymentDetails) {
        if (payment.amount > 0) {
            credits.push(payment);
        } else if (payment.amount < 0) {
            debts.push(payment);
        }
    }

    return debts.reduce<Debt[]>((acc, debt) => {
        let remainingDebt = debt.amount;

        credits.forEach((credit) => {
            if (credit.amount > 0) {
                const transferAmount = Math.min(-remainingDebt, credit.amount);

                acc.push({
                    person: debt.person,
                    amount: transferAmount,
                    creditor: credit.person,
                });

                remainingDebt += transferAmount;
                credit.amount -= transferAmount;
            }
        });

        return acc;
    }, []);
}
