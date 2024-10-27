import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { splitExpensesEqually, organizePayments, type Expense, type Debt } from "./utils/helpers";
import styles from "./page.module.scss";

interface State {
    expenses: Expense[];
    debts: Debt[] | null;
}

const priceFormatter = new Intl.NumberFormat();

const stateCookieId = "state";

const initialState: State = {
    expenses: [],
    debts: null,
};

let errorMessage: string = "";

export default async function Home(): Promise<JSX.Element> {
    const storedState: State = JSON.parse((await cookies()).get(stateCookieId)?.value || JSON.stringify(initialState));

    /**
     * Handler function to set an expense.
     * @param formData - Form data to set the expense.
     */
    async function setExpense(formData: FormData): Promise<void> {
        "use server";

        const expense = Object.fromEntries(formData) as unknown as Expense;

        if (expense.person && !isNaN(expense.amount)) {
            const updatedExpenses: Expense[] = [
                ...storedState.expenses,
                {
                    person: expense.person,
                    amount: Number(expense.amount) || 0,
                },
            ];

            const splitExpenses = splitExpensesEqually(updatedExpenses);
            const organizedDebts = organizePayments(splitExpenses);

            initialState.expenses = updatedExpenses;
            initialState.debts = organizedDebts;
            errorMessage = "";

            (await cookies()).set(stateCookieId, JSON.stringify(initialState));
        } else {
            errorMessage = "Please enter valid person and expense amount.";
        }

        revalidatePath(".");
    }

    /**
     * Function to reset the cookies and the state.
     */
    async function resetCookies(): Promise<void> {
        "use server";

        (await cookies()).delete(stateCookieId);

        initialState.expenses = [];
        initialState.debts = null;
        errorMessage = "";

        revalidatePath(".");
    }

    return (
        <main className={styles["container"]}>
            <h1>Expense Splitter</h1>

            <form className={styles["form"]} action={setExpense}>
                <div className={styles["field"]}>
                    <label htmlFor="person">Person</label>
                    <input type="text" name="person" autoFocus />
                </div>

                <div className={styles["field"]}>
                    <label htmlFor="amount">Amount</label>
                    <input type="number" name="amount" pattern="[0-9]*" inputMode="numeric" />
                </div>

                {errorMessage && <small className={styles["error-message"]}>{errorMessage}</small>}

                <button className={styles["add-btn"]}>Add</button>
            </form>

            {!!initialState.expenses.length && (
                <>
                    <ul className={styles["list"]}>
                        {initialState.expenses.map((expense, i) => (
                            <li key={`${expense.person}_${expense.amount}_${i}`}>
                                {expense.person}: <b>${priceFormatter.format(expense.amount || 0)}</b>
                                {!expense.amount && <span>🐀</span>}
                            </li>
                        ))}
                    </ul>

                    <p>
                        <b>Total: ${priceFormatter.format(initialState.expenses.reduce((acc, expense) => (acc += expense.amount), 0))}</b>
                    </p>

                    {initialState.debts && (
                        <ul className={styles["list"]}>
                            {initialState.debts.length
                                ? initialState.debts.map((payment) => (
                                      <li key={`${payment.person}_${payment.amount}`}>
                                          {`${payment.person} pays `}
                                          <b>${priceFormatter.format(Number(payment.amount.toFixed(2)))}</b>
                                          {` to ${payment.creditor}`}
                                      </li>
                                  ))
                                : "No payments needed, everyone's expenses are equal"}
                        </ul>
                    )}

                    <button type="button" className={styles["reset-btn"]} onClick={resetCookies}>
                        Reset
                    </button>
                </>
            )}
        </main>
    );
}
