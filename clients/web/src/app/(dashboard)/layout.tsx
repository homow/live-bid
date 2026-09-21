import DashboardMenu from "@/featuer/Dashboard/DashboardMenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#151923]">
      <DashboardMenu />

      <main>{children}</main>
    </div>
  );
}
