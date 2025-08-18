export interface Expense {
    /** The person associated with the expense. */
    person: string;
    /** The amount of the expense. */
    amount: number;
}

export interface Debt extends Expense {
    /** The creditor associated with the debt. */
    creditor?: string;
}

export interface State {
    expenses: Expense[];
    debts: Debt[] | null;
    language: "es" | "en";
    theme: "dark" | "light";
}
