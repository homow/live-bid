import DashboardHero from "@/featuer/Dashboard/components/DashboardHero";
import DashboardStats from "@/featuer/Dashboard/components/DashboardStats";
import LiveAuctions from "@/featuer/Dashboard/components/LiveAuctions";
import RecentActivity from "@/featuer/Dashboard/components/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <DashboardHero />

      <DashboardStats />

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1.5fr_1fr]">
        <LiveAuctions />
        <RecentActivity />
      </div>
    </div>
  );
}
