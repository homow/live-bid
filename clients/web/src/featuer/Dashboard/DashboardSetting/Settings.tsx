import SettingAccont from "./SettingAccont";
import SettingProfile from "./SettingProfile";

const Settings = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start">
      <SettingProfile />
      <SettingAccont />
    </div>
  );
};

export default Settings;