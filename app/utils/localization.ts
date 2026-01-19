/**
 * Localization strings for the expense splitter application.
 * Supports Spanish (es) and English (en).
 */
export const translations = {
    es: {
        // Core
        title: "Amigastos",
        description: "Divide gastos de manera justa entre amigos",
        addExpense: "Agregar Nuevo Gasto",
        personName: "Nombre de la Persona",
        personPlaceholder: "Ingresa el nombre",
        amount: "Cantidad ($)",
        amountPlaceholder: "0.00",
        addButton: "Agregar Gasto",
        expenses: "Gastos",
        items: "elementos",
        total: "Total",
        paymentSummary: "Resumen de Pagos",
        pays: "paga a",
        noPayments: "¡No se necesitan pagos!",
        expensesEqual: "Los gastos de todos son iguales",
        resetAll: "Reiniciar Todo",
        errorMessage: "Por favor ingresa un nombre válido y cantidad de gasto.",
        language: "Idioma",
        theme: "Tema",

        // Mark as Paid/Settled
        markPaid: "Marcar como pagado",
        markUnpaid: "Marcar como pendiente",
        settledOn: "Pagado el",
        settled: "Pagado",
        pending: "Pendiente",

        // Options
        options: "Opciones",
        showRatEmoji: "Mostrar emoji de rata",
        close: "Cerrar",

        // Groups
        groups: "Grupos",
        addGroup: "Agregar Grupo",
        editGroup: "Editar Grupo",
        deleteGroup: "Eliminar Grupo",
        groupName: "Nombre del Grupo",
        groupNamePlaceholder: "Ej: Comida vegana, Kayak",
        participants: "Participantes",
        selectParticipants: "Seleccionar participantes",
        addParticipantPlaceholder: "Agregar participante...",
        suggestedParticipants: "Agregar rápido:",
        noGroups: "Sin grupos definidos",
        noGroupsDescription: "Los gastos se dividirán entre todos",
        everyoneShared: "Compartido (todos)",
        manageGroups: "Administrar Grupos",
        createGroup: "Crear Grupo",
        saveGroup: "Guardar",
        cancel: "Cancelar",
        groupExpense: "Grupo",

        // Sharing
        share: "Compartir",
        shareUrl: "Compartir URL",
        copyLink: "Copiar enlace",
        linkCopied: "¡Enlace copiado!",
        dataTooLarge: "Datos muy grandes para URL",
        sharedView: "Vista Compartida",
        sharedViewDescription: "Esta es una vista de solo lectura",
        importData: "Importar a mi sesión",
        importSuccess: "¡Datos importados exitosamente!",

        // AI Analysis
        aiAnalysis: "Análisis con IA",
        suggestSettlement: "Optimizar pagos",
        analyzePatterns: "Analizar patrones",
        getInsights: "Obtener consejos",
        analyzing: "Analizando...",
        analysisError: "Error al analizar. Verifica tu API key.",
        noDataToAnalyze: "Agrega gastos para analizar",
        transactions: "transacciones",
    },
    en: {
        // Core
        title: "Expense Splitter",
        description: "Split expenses fairly among friends",
        addExpense: "Add New Expense",
        personName: "Person Name",
        personPlaceholder: "Enter person's name",
        amount: "Amount ($)",
        amountPlaceholder: "0.00",
        addButton: "Add Expense",
        expenses: "Expenses",
        items: "items",
        total: "Total",
        paymentSummary: "Payment Summary",
        pays: "pays to",
        noPayments: "No payments needed!",
        expensesEqual: "Everyone's expenses are equal",
        resetAll: "Reset All",
        errorMessage: "Please enter valid person and expense amount.",
        language: "Language",
        theme: "Theme",

        // Mark as Paid/Settled
        markPaid: "Mark as paid",
        markUnpaid: "Mark as unpaid",
        settledOn: "Paid on",
        settled: "Paid",
        pending: "Pending",

        // Options
        options: "Options",
        showRatEmoji: "Show rat emoji",
        close: "Close",

        // Groups
        groups: "Groups",
        addGroup: "Add Group",
        editGroup: "Edit Group",
        deleteGroup: "Delete Group",
        groupName: "Group Name",
        groupNamePlaceholder: "E.g.: Vegan food, Kayaking",
        participants: "Participants",
        selectParticipants: "Select participants",
        addParticipantPlaceholder: "Add participant...",
        suggestedParticipants: "Quick add:",
        noGroups: "No groups defined",
        noGroupsDescription: "Expenses will be split among everyone",
        everyoneShared: "Shared (everyone)",
        manageGroups: "Manage Groups",
        createGroup: "Create Group",
        saveGroup: "Save",
        cancel: "Cancel",
        groupExpense: "Group",

        // Sharing
        share: "Share",
        shareUrl: "Share URL",
        copyLink: "Copy link",
        linkCopied: "Link copied!",
        dataTooLarge: "Data too large for URL",
        sharedView: "Shared View",
        sharedViewDescription: "This is a read-only view",
        importData: "Import to my session",
        importSuccess: "Data imported successfully!",

        // AI Analysis
        aiAnalysis: "AI Analysis",
        suggestSettlement: "Optimize payments",
        analyzePatterns: "Analyze patterns",
        getInsights: "Get insights",
        analyzing: "Analyzing...",
        analysisError: "Analysis failed. Check your API key.",
        noDataToAnalyze: "Add expenses to analyze",
        transactions: "transactions",
    },
};

/**
 * Type for locale keys to ensure type safety when accessing translations.
 */
export type LocaleKey = keyof (typeof translations)["en"];
