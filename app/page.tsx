import { revalidatePath } from "next/cache";
import type { Expense } from "./utils/types";
import { splitExpensesEqually, organizePayments, priceFormatter } from "./utils/helpers";
import { translations } from "./utils/localization";
import { getState, resetState, setState } from "./actions";
import { Icon } from "./components/Icon";

let errorMessage: string = "";

export default async function Home(): Promise<JSX.Element> {
    const state = await getState();
    const locale = translations[state.language];
    const isDark = state.theme === "dark";

    /**
     * Handler function to set an expense.
     * @param formData - Form data to set the expense.
     */
    async function setExpense(formData: FormData): Promise<void> {
        "use server";

        const expense = Object.fromEntries(formData) as unknown as Expense;

        if (expense.person && !isNaN(expense.amount)) {
            errorMessage = "";

            await setState((prevState) => {
                const updatedExpenses: Expense[] = [
                    ...prevState.expenses,
                    {
                        person: expense.person,
                        amount: Number(expense.amount) || 0,
                    },
                ];

                const splitExpenses = splitExpensesEqually(updatedExpenses);
                const organizedDebts = organizePayments(splitExpenses);

                return {
                    expenses: updatedExpenses,
                    debts: organizedDebts,
                };
            });
        } else {
            errorMessage = locale.errorMessage;
        }

        revalidatePath(".");
    }

    /**
     * Function to toggle language.
     */
    async function toggleLanguage(): Promise<void> {
        "use server";

        await setState((prevState) => ({ language: prevState.language === "es" ? "en" : "es" }));
        revalidatePath(".");
    }

    /**
     * Function to toggle theme.
     */
    async function toggleTheme(): Promise<void> {
        "use server";

        await setState((prevState) => ({ theme: prevState.theme === "dark" ? "light" : "dark" }));
        revalidatePath(".");
    }

    /**
     * Function to reset the application state.
     */
    async function resetApplicationState(): Promise<void> {
        "use server";

        errorMessage = "";
        await resetState();
        revalidatePath(".");
    }

    return (
        <main className={`min-h-screen transition-colors duration-300 py-8 px-4 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header with Theme and Language Toggle */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3">
                            <form action={toggleTheme}>
                                <button
                                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                                        isDark
                                            ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                                    }`}
                                >
                                    <Icon name={isDark ? "Moon" : "Sun"} className="w-4 h-4" />
                                    {locale.theme}
                                </button>
                            </form>

                            <form action={toggleLanguage}>
                                <button
                                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 border ${
                                        isDark
                                            ? "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
                                    }`}
                                >
                                    <Icon name="World" className="w-4 h-4" />
                                    {state.language === "es" ? "ES" : "EN"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className={`text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{locale.title}</h1>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>{locale.description}</p>
                    </div>
                </div>

                {/* Add Expense Form */}
                <div
                    className={`rounded-xl shadow-lg p-6 mb-8 border transition-colors duration-300 hover-lift ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                >
                    <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        <Icon name="Money" className="w-6 h-6" />
                        {locale.addExpense}
                    </h2>

                    <form action={setExpense} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="person" className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {locale.personName}
                                </label>

                                <input
                                    type="text"
                                    name="person"
                                    placeholder={locale.personPlaceholder}
                                    autoFocus
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {locale.amount}
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    placeholder={locale.amountPlaceholder}
                                    step="0.01"
                                    className={`w-full px-4 py-3 border rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        isDark
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                    }`}
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div
                                className={`border rounded-lg p-4 ${
                                    isDark ? "bg-red-900/20 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"
                                }`}
                            >
                                <small className="font-medium flex items-center gap-2">
                                    <Icon name="Error" className="w-4 h-4" />
                                    {errorMessage}
                                </small>
                            </div>
                        )}

                        <button className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2">
                            <Icon name="Plus" className="w-4 h-4" />
                            {locale.addButton}
                        </button>
                    </form>
                </div>

                {!!state.expenses.length && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expenses List */}
                        <div
                            className={`rounded-xl shadow-lg p-6 border transition-colors duration-300 hover-lift animate-slide-in ${
                                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    <Icon name="People" className="w-6 h-6" />
                                    {locale.expenses}
                                </h2>

                                <span
                                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                                        isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {state.expenses.length} {locale.items}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                {state.expenses.map((expense, i) => (
                                    <div
                                        key={`${expense.person}_${expense.amount}_${i}`}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-300 ${
                                            isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                    isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                                                }`}
                                            >
                                                {expense.person.charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{expense.person}</span>
                                                {!expense.amount && <span className="ml-2">🐀</span>}
                                            </div>
                                        </div>

                                        <span
                                            className={`font-semibold px-3 py-1 rounded ${
                                                isDark ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-900"
                                            }`}
                                        >
                                            ${priceFormatter.format(expense.amount || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={`border-t pt-4 ${isDark ? "border-gray-600" : "border-gray-200"}`}>
                                <div
                                    className={`flex justify-between items-center p-4 rounded-lg ${
                                        isDark ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
                                    }`}
                                >
                                    <span className={`font-semibold flex items-center gap-2 ${isDark ? "text-green-200" : "text-green-800"}`}>
                                        <Icon name="Accounts" className="w-6 h-6" />
                                        {locale.total}
                                    </span>

                                    <span className={`text-xl font-bold ${isDark ? "text-green-200" : "text-green-800"}`}>
                                        ${priceFormatter.format(state.expenses.reduce((acc, expense) => (acc += expense.amount), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div
                            className={`rounded-xl shadow-lg p-6 border transition-colors duration-300 hover-lift animate-slide-in ${
                                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                            }`}
                        >
                            <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Icon name="CreditCard" className="w-6 h-6" />
                                {locale.paymentSummary}
                            </h2>

                            {state.debts && (
                                <div className="space-y-3">
                                    {state.debts.length ? (
                                        state.debts.map((payment, index) => (
                                            <div
                                                key={`${payment.person}_${payment.amount}`}
                                                className={`p-4 border rounded-lg transition-colors duration-300 ${
                                                    isDark ? "bg-orange-900/20 border-orange-800" : "bg-orange-50 border-orange-200"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                                isDark ? "bg-orange-600 text-white" : "bg-orange-500 text-white"
                                                            }`}
                                                        >
                                                            {payment.person.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                                                {payment.person}
                                                            </div>
                                                            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                                {locale.pays} {payment.creditor}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`font-semibold px-3 py-1 rounded ${
                                                                isDark ? "bg-gray-700 text-white" : "bg-white text-gray-900 border border-gray-200"
                                                            }`}
                                                        >
                                                            ${priceFormatter.format(Number(payment.amount.toFixed(2)))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-4">🎉</div>
                                            <p className={`font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{locale.noPayments}</p>
                                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{locale.expensesEqual}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reset Button */}
                {!!state.expenses.length && (
                    <div className="mt-8 text-center">
                        <form action={resetApplicationState}>
                            <button
                                type="submit"
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
                            >
                                <Icon name="TrashCan" className="w-5 h-5" />
                                {locale.resetAll}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}
