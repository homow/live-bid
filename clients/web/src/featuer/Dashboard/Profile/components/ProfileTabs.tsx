import { ProfileTabType } from "../Profile";

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onChange: (tab: ProfileTabType) => void;
}

const tabs: {
  label: string;
  value: ProfileTabType;
}[] = [
  { label: "Profile Information", value: "information" },
  { label: "Change Password", value: "password" },
  { label: "Update Profile", value: "update" },
];

export default function ProfileTabs({ activeTab, onChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-5  border-b border-[#202D59]">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`
            relative shrink-0 pb-3 text-sm transition-colors
            ${
              activeTab === tab.value
                ? "font-semibold text-[#9B83FF]"
                : "text-[#A1A7B8] hover:text-white"
            }
          `}
        >
          {tab.label}

          {activeTab === tab.value && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7046FF]" />
          )}
        </button>
      ))}
    </div>
  );
}
