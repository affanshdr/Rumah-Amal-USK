import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar adminName="Admin Rumah Amal" />
            <main className="flex-1 p-6 sm:p-8">{children}</main>
        </div>
    );
}