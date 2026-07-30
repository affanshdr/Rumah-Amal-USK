import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";


const jakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-jakarta",
});

export const metadata: Metadata = {
    title: "Rumah Amal Masjid Jamik Universitas Syiah Kuala",
    description:
        "Lembaga pengelola zakat, infaq, dan sedekah Masjid Jamik Universitas Syiah Kuala Banda Aceh.",
    keywords: ["Rumah Amal", "USK", "Masjid Jamik USK", "Zakat USK", "Infak USK", "Universitas Syiah Kuala"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" className={`${jakartaSans.variable} font-sans antialiased`}>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
