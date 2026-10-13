import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/Components/Ui/card/card";

import { Input } from "@/Components/Ui/input";
import { Label } from "@/Components/Ui/label";
import { infUser } from "@/mocks/user_info";

const SettingAccont = () => {
  return (
    <div className="flex w-full justify-center px-4 py-8">
      <Card className="w-full  border-slate-800 bg-[#11151d]">
        <CardHeader>
          <CardTitle className="mt-2 text-center text-lg font-semibold text-white">
            User Information
          </CardTitle>
        </CardHeader>

        <CardContent className="mb-4 space-y-5">
          {infUser.map((item) => (
            <div key={item.label} className="space-y-2">
              <Label>{item.label}</Label>

              <Input type={item.type} readOnly />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingAccont;
