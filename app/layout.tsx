import type { Metadata } from "next";
import { Inter, Noto_Serif } from "next/font/google";
import "../styles/main.scss";

const fontPrimary = Inter({
    subsets: ["latin"],
    weight: ["100", "300", "400", "500", "700", "900"],
    variable: "--font-primary",
});

const fontSecondary = Noto_Serif({
    subsets: ["latin"],
    weight: ["200", "400", "700"],
    variable: "--font-secondary",
});

export const metadata: Metadata = {
    title: "Expenses splitter",
    description: "",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
    return (
        <html lang="en">
            <body className={[fontPrimary.variable, fontSecondary.variable].join(" ")}>{children}</body>
        </html>
    );
}
