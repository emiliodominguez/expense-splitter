import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import { translations } from "./utils/localization";
import { getState } from "./actions";
import "../styles/main.scss";

const fontPrimary = Poppins({
    subsets: ["latin"],
    weight: ["100", "300", "400", "500", "700", "900"],
    variable: "--font-primary",
});

const fontSecondary = Lora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-secondary",
});

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): Promise<JSX.Element> {
    const state = await getState();

    return (
        <html lang="en" className={state.theme === "dark" ? "dark" : ""}>
            <body className={[fontPrimary.variable, fontSecondary.variable].join(" ")}>{children}</body>
        </html>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    const state = await getState();
    const locale = translations[state.language || "es"];

    return {
        title: locale.title,
        description: locale.description,
    };
}
