import { revalidatePath } from "next/cache";
import type { Expense } from "./utils/types";
import { splitExpensesByGroups, organizePayments, priceFormatter, generateExpenseId } from "./utils/helpers";
import { translations } from "./utils/localization";
import { getState, resetState, setState, settleDebt, unsettleDebt } from "./actions";
import { Icon } from "./components/Icon";
import { OptionsPanel } from "./components/OptionsPanel";
import { ShareButton } from "./components/ShareButton";
import { GroupManager } from "./components/GroupManager";
import { AiAnalysis } from "./components/AiAnalysis";

let errorMessage: string = "";

interface PageProps {
    searchParams: Promise<{ data?: string; view?: string }>;
}

export default async function Home({ searchParams }: PageProps): Promise<React.ReactNode> {
    const params = await searchParams;
    const state = await getState();
    const locale = translations[state.language];
    const isDark = state.theme === "dark";
    const isViewMode = params.view === "true";

    /**
     * Handler function to set an expense.
     * @param formData - Form data to set the expense.
     */
    async function setExpense(formData: FormData): Promise<void> {
        "use server";

        const person = formData.get("person") as string;
        const amountRaw = formData.get("amount") as string;
        const groupId = formData.get("groupId") as string | null;

        // Normalize decimal separator: replace comma with dot
        const amount = amountRaw?.replace(",", ".");

        if (person && !isNaN(Number(amount))) {
            errorMessage = "";

            await setState((prevState) => {
                const newExpense: Expense = {
                    id: generateExpenseId(),
                    person: person.trim(),
                    amount: Number(amount) || 0,
                    groupId: groupId || undefined,
                };

                const updatedExpenses: Expense[] = [...prevState.expenses, newExpense];
                const splitExpenses = splitExpensesByGroups(updatedExpenses, prevState.groups);
                const organizedDebts = organizePayments(splitExpenses);

                return {
                    expenses: updatedExpenses,
                    debts: organizedDebts,
                };
            });
        } else {
            errorMessage = translations[state.language].errorMessage;
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

    /**
     * Function to toggle debt settlement status.
     * @param index - The index of the debt to toggle.
     * @param isSettled - Whether the debt is currently settled.
     */
    async function toggleDebtSettlement(index: number, isSettled: boolean): Promise<void> {
        "use server";

        if (isSettled) {
            await unsettleDebt(index);
        } else {
            await settleDebt(index);
        }
        revalidatePath(".");
    }

    // Get unique people from expenses for group management
    const uniquePeople = Array.from(new Set(state.expenses.map((e) => e.person)));

    // Create a map of group ID to group name for display
    const groupMap = new Map(state.groups.map((g) => [g.id, g.name]));

    // Create a map of person to groups they belong to
    const personGroups = new Map<string, string[]>();
    for (const group of state.groups) {
        for (const participant of group.participants) {
            const existing = personGroups.get(participant) || [];
            personGroups.set(participant, [...existing, group.name]);
        }
    }

    return (
        <main
            className={`min-h-screen transition-colors duration-300 ${
                isDark
                    ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white"
                    : "bg-gradient-to-br from-slate-50 via-white to-violet-50 text-gray-900"
            }`}
        >
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* View Mode Banner */}
                {isViewMode && (
                    <div
                        className={`mb-6 p-4 rounded-2xl border text-center backdrop-blur-sm ${
                            isDark ? "bg-blue-500/10 border-blue-500/30 text-blue-200" : "bg-blue-500/10 border-blue-200 text-blue-700"
                        }`}
                    >
                        <p className="font-medium">{locale.sharedView}</p>
                        <p className="text-sm opacity-80">{locale.sharedViewDescription}</p>
                    </div>
                )}

                {/* Header with Options */}
                <div className="text-center mb-10">
                    <div className="flex flex-wrap justify-end items-center gap-2 mb-8">
                        {!!state.expenses.length && !isViewMode && (
                            <ShareButton state={state} isDark={isDark} locale={locale} />
                        )}
                        <OptionsPanel
                            isDark={isDark}
                            locale={locale}
                            currentLanguage={state.language}
                            toggleThemeAction={toggleTheme}
                            toggleLanguageAction={toggleLanguage}
                        />
                    </div>

                    <div className="mb-8">
                        <h1
                            className={`text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight ${
                                isDark
                                    ? "bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent"
                                    : "bg-gradient-to-r from-gray-900 via-violet-700 to-violet-500 bg-clip-text text-transparent"
                            }`}
                        >
                            {locale.title}
                        </h1>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>{locale.description}</p>
                    </div>
                </div>

                {/* Add Expense Form - Only show if not in view mode */}
                {!isViewMode && (
                    <div
                        className={`rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border backdrop-blur-sm transition-all duration-300 ${
                            isDark
                                ? "bg-gray-800/80 border-gray-700/50 shadow-gray-900/50"
                                : "bg-white/80 border-gray-200/50 shadow-gray-200/50"
                        }`}
                    >
                        <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <div className={`p-2 rounded-xl ${isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                                <Icon name="Money" className="w-5 h-5" />
                            </div>
                            {locale.addExpense}
                        </h2>

                        <form action={setExpense} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="person" className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {locale.personName}
                                    </label>

                                    <input
                                        type="text"
                                        name="person"
                                        placeholder={locale.personPlaceholder}
                                        autoFocus
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-violet-500 ${
                                            isDark
                                                ? "bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {locale.amount}
                                    </label>

                                    <input
                                        type="text"
                                        name="amount"
                                        inputMode="decimal"
                                        placeholder={locale.amountPlaceholder}
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-violet-500 ${
                                            isDark
                                                ? "bg-gray-900/50 border-gray-600 text-white placeholder-gray-500"
                                                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="groupId" className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {locale.groupExpense}
                                    </label>

                                    <select
                                        name="groupId"
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-0 focus:border-violet-500 ${
                                            isDark
                                                ? "bg-gray-900/50 border-gray-600 text-white"
                                                : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white"
                                        }`}
                                    >
                                        <option value="">{locale.everyoneShared}</option>
                                        {state.groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {errorMessage && (
                                <div
                                    className={`border-2 rounded-xl p-4 ${
                                        isDark ? "bg-red-500/10 border-red-500/30 text-red-200" : "bg-red-50 border-red-200 text-red-600"
                                    }`}
                                >
                                    <small className="font-medium flex items-center gap-2">
                                        <Icon name="Error" className="w-4 h-4" />
                                        {errorMessage}
                                    </small>
                                </div>
                            )}

                            <button className="cursor-pointer w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                                <Icon name="Plus" className="w-5 h-5" />
                                {locale.addButton}
                            </button>
                        </form>
                    </div>
                )}

                {/* Group Manager - Only show if not in view mode */}
                {!isViewMode && <GroupManager state={state} isDark={isDark} locale={locale} uniquePeople={uniquePeople} />}

                {!!state.expenses.length && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expenses List */}
                        <div
                            className={`rounded-2xl shadow-xl p-6 border backdrop-blur-sm transition-all duration-300 ${
                                isDark
                                    ? "bg-gray-800/80 border-gray-700/50 shadow-gray-900/50"
                                    : "bg-white/80 border-gray-200/50 shadow-gray-200/50"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    <div className={`p-2 rounded-xl ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                                        <Icon name="People" className="w-5 h-5" />
                                    </div>
                                    {locale.expenses}
                                </h2>

                                <span
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                        isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700"
                                    }`}
                                >
                                    {state.expenses.length} {locale.items}
                                </span>
                            </div>

                            <div className="space-y-2 mb-6">
                                {state.expenses.map((expense, i) => (
                                    <div
                                        key={expense.id || `${expense.person}_${expense.amount}_${i}`}
                                        className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                                            isDark ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                    isDark
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                                        : "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                                                }`}
                                            >
                                                {expense.person.charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{expense.person}</span>
                                                    {!expense.amount && <span className="rat-emoji">🐀</span>}
                                                </div>
                                                {/* Show expense group if assigned */}
                                                {expense.groupId && groupMap.has(expense.groupId) && (
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium ${isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"}`}>
                                                        {groupMap.get(expense.groupId)}
                                                    </span>
                                                )}
                                                {/* Show all groups the person belongs to */}
                                                {personGroups.has(expense.person) && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {personGroups.get(expense.person)!.map((groupName) => (
                                                            <span
                                                                key={groupName}
                                                                className={`text-xs px-2 py-0.5 rounded-md font-medium ${isDark ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-600"}`}
                                                            >
                                                                {groupName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <span
                                            className={`font-bold px-3 py-1.5 rounded-lg text-sm ${
                                                isDark ? "bg-gray-700 text-white" : "bg-white text-gray-900 shadow-sm"
                                            }`}
                                        >
                                            ${priceFormatter.format(expense.amount || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={`border-t pt-4 ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
                                <div
                                    className={`flex justify-between items-center p-4 rounded-xl ${
                                        isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                                    }`}
                                >
                                    <span className={`font-bold flex items-center gap-2 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                        <Icon name="Accounts" className="w-5 h-5" />
                                        {locale.total}
                                    </span>

                                    <span className={`text-xl font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                                        ${priceFormatter.format(state.expenses.reduce((acc, expense) => (acc += expense.amount), 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div
                            className={`rounded-2xl shadow-xl p-6 border backdrop-blur-sm transition-all duration-300 ${
                                isDark
                                    ? "bg-gray-800/80 border-gray-700/50 shadow-gray-900/50"
                                    : "bg-white/80 border-gray-200/50 shadow-gray-200/50"
                            }`}
                        >
                            <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <div className={`p-2 rounded-xl ${isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
                                    <Icon name="CreditCard" className="w-5 h-5" />
                                </div>
                                {locale.paymentSummary}
                            </h2>

                            {state.debts && (
                                <div className="space-y-2">
                                    {state.debts.length ? (
                                        state.debts.map((payment, index) => (
                                            <div
                                                key={`${payment.person}_${payment.creditor}_${payment.amount}`}
                                                className={`p-4 rounded-xl transition-all duration-200 ${
                                                    payment.settled
                                                        ? isDark
                                                            ? "bg-emerald-500/10"
                                                            : "bg-emerald-50"
                                                        : isDark
                                                            ? "bg-orange-500/10"
                                                            : "bg-orange-50"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                                payment.settled
                                                                    ? isDark
                                                                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                                                                        : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                                                                    : isDark
                                                                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                                                                        : "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                                                            }`}
                                                        >
                                                            {payment.settled ? (
                                                                <Icon name="Check" className="w-5 h-5" />
                                                            ) : (
                                                                payment.person.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className={`font-semibold ${payment.settled ? "line-through opacity-60" : ""} ${isDark ? "text-white" : "text-gray-900"}`}>
                                                                {payment.person}
                                                            </div>
                                                            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                                {locale.pays} {payment.creditor}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`font-bold px-3 py-1.5 rounded-lg text-sm ${
                                                                payment.settled
                                                                    ? isDark
                                                                        ? "bg-emerald-500/20 text-emerald-300"
                                                                        : "bg-emerald-100 text-emerald-700"
                                                                    : isDark
                                                                        ? "bg-gray-700 text-white"
                                                                        : "bg-white text-gray-900 shadow-sm"
                                                            }`}
                                                        >
                                                            ${priceFormatter.format(Number(payment.amount.toFixed(2)))}
                                                        </span>

                                                        {!isViewMode && (
                                                            <form action={toggleDebtSettlement.bind(null, index, !!payment.settled)}>
                                                                <button
                                                                    type="submit"
                                                                    className={`p-2 rounded-xl transition-all duration-200 ${
                                                                        payment.settled
                                                                            ? isDark
                                                                                ? "bg-emerald-500 text-white hover:bg-emerald-400"
                                                                                : "bg-emerald-500 text-white hover:bg-emerald-400"
                                                                            : isDark
                                                                                ? "bg-gray-700 text-gray-400 hover:bg-emerald-500 hover:text-white"
                                                                                : "bg-gray-100 text-gray-400 hover:bg-emerald-500 hover:text-white"
                                                                    }`}
                                                                    title={payment.settled ? locale.markUnpaid : locale.markPaid}
                                                                >
                                                                    <Icon name="Check" className="w-4 h-4" />
                                                                </button>
                                                            </form>
                                                        )}
                                                    </div>
                                                </div>

                                                {payment.settled && payment.settledAt && (
                                                    <div className={`mt-2 text-xs ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                        {locale.settledOn} {new Date(payment.settledAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <div className="text-5xl mb-4">🎉</div>
                                            <p className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{locale.noPayments}</p>
                                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{locale.expensesEqual}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Analysis Section */}
                {!!state.expenses.length && !isViewMode && (
                    <AiAnalysis state={state} isDark={isDark} locale={locale} />
                )}

                {/* Reset Button */}
                {!!state.expenses.length && !isViewMode && (
                    <div className="mt-10 text-center">
                        <form action={resetApplicationState}>
                            <button
                                type="submit"
                                className={`cursor-pointer py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto ${
                                    isDark
                                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                                        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                }`}
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
