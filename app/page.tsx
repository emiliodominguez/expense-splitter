"use client";

import { useState } from "react";
import styles from "./page.module.scss";
import { splitExpensesEqually, organizePayments, type Expense, type Debt } from "./utils/helpers";

export default function Home(): JSX.Element {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [payments, setPayments] = useState<Debt[] | null>(null);

    function handleFormSubmit(e: React.FormEvent<HTMLFormElement>): void {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const expense = Object.fromEntries(formData) as unknown as Expense;

        if (expense.person && !isNaN(expense.amount) && expense.amount > 0) {
            setExpenses((prev) => [...prev, expense]);
        } else {
            alert("Please enter valid person and expense amount.");
        }

        calculate();
    }

    function calculate(): void {
        if (!expenses.length) {
            alert("Please add at least one person and their expenses.");
            return;
        }

        const paymentDetails = splitExpensesEqually(expenses);

        setPayments(organizePayments(paymentDetails));
    }

    return (
        <main className={styles["container"]}>
            <h1>Expense Splitter</h1>

            <form className={styles["form"]} onSubmit={handleFormSubmit}>
                <div className={styles["field"]}>
                    <label htmlFor="person">Person</label>
                    <input type="text" name="person" />
                </div>

                <div className={styles["field"]}>
                    <label htmlFor="amount">Amount</label>
                    <input type="number" name="amount" />
                </div>

                <button className={styles["add-btn"]}>Add</button>
            </form>

            {!!expenses.length && (
                <>
                    <ul className={styles["list"]}>
                        {expenses.map((expense) => (
                            <li key={`${expense.person}_${expense.amount}`}>
                                {expense.person}: {expense.amount}
                            </li>
                        ))}
                    </ul>

                    <p>
                        <b>Total: {expenses.reduce((acc, expense) => (acc += Number(expense.amount)), 0)}</b>
                    </p>

                    {payments && (
                        <ul className={styles["list"]}>
                            {payments.length
                                ? payments.map((payment) => (
                                      <li key={`${payment.person}_${payment.amount}`}>
                                          {`${payment.person} pays ${payment.amount} to ${payment.creditor}`}
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
