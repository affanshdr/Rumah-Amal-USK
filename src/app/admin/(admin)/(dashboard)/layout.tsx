import type { Metadata } from "next";
import "@/app/globals.css";
import AdminSidebar from '@/components/AdminSidebar';

export const metadata: Metadata = {
    title: "Admin - Rumah Amal USK",
    description: "Panel admin Rumah Amal Masjid Jamik USK",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body className="antialiased">
                <div className="flex min-h-screen bg-gray-100">
                    <AdminSidebar adminName="Admin Rumah Amal" />
                    <main className="flex-1 p-6 sm:p-8">{children}</main>
                </div>
            </body>
        </html>
    );
}