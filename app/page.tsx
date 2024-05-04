"use client";

import { useState } from "react";
import styles from "./page.module.scss";
import { splitExpensesEqually, organizePayments, type Expense, type Debt } from "./utils/helpers";

const priceFormatter = new Intl.NumberFormat();

export default function Home(): JSX.Element {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [debts, setDebts] = useState<Debt[] | null>(null);

    function setExpense(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const expense = Object.fromEntries(formData) as unknown as Expense;

        if (expense.person && !isNaN(expense.amount)) {
            setExpenses((prev) => {
                const updatedExpenses: Expense[] = [
                    ...prev,
                    {
                        person: expense.person,
                        amount: Number(expense.amount) || 0,
                    },
                ];

                const splitExpenses = splitExpensesEqually(updatedExpenses);
                const organizedDebts = organizePayments(splitExpenses);

                setDebts(organizedDebts);

                return updatedExpenses;
            });

            // Reset form
            e.currentTarget.reset();

            // Focus on first input
            const firstInput = e.currentTarget.querySelector("input");
            firstInput?.focus();
        } else {
            alert("Please enter valid person and expense amount.");
        }
    }

    return (
        <main className={styles["container"]}>
            <h1>Expense Splitter</h1>

            <form className={styles["form"]} onSubmit={setExpense}>
                <div className={styles["field"]}>
                    <label htmlFor="person">Person</label>
                    <input type="text" name="person" />
                </div>

                <div className={styles["field"]}>
                    <label htmlFor="amount">Amount</label>
                    <input type="number" name="amount" pattern="[0-9]*" inputMode="numeric" />
                </div>

                <button className={styles["add-btn"]}>Add</button>
            </form>

            {!!expenses.length && (
                <>
                    <ul className={styles["list"]}>
                        {expenses.map((expense) => (
                            <li key={`${expense.person}_${expense.amount}`}>
                                {expense.person}: {priceFormatter.format(expense.amount || 0)}
                            </li>
                        ))}
                    </ul>

                    <p>
                        <b>Total: {priceFormatter.format(expenses.reduce((acc, expense) => (acc += expense.amount), 0))}</b>
                    </p>

                    {debts && (
                        <ul className={styles["list"]}>
                            {debts.length
                                ? debts.map((payment) => (
                                      <li key={`${payment.person}_${payment.amount}`}>
                                          {`${payment.person} pays ${priceFormatter.format(payment.amount)} to ${payment.creditor}`}
                                      </li>
                                  ))
                                : "No payments needed, everyone's expenses are equal"}
                        </ul>
                    )}
                </>
            )}
        </main>
    );
}
