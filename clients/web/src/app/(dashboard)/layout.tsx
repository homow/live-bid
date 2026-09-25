import DashboardHeader from "@/featuer/Dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#151923]">
      <DashboardHeader />

      <main>{children}</main>
    </div>
  );
}