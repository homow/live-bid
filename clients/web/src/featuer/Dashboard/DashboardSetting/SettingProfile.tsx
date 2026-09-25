import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/Components/Ui/card/card";

import { User } from "lucide-react";
import { Button } from "@/Components/Ui/button/button";

import { P } from "@/Components/Ui/typography/typography";
const SettingProfile = () => {
  return (
    <div className="flex w-full justify-center px-4 py-8">
      <Card className="w-full max-w-xl border-slate-800 bg-[#11151d]">
        <CardHeader>
          <CardTitle className="mt-4 text-center text-lg text-white">
            Profile Image
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center mb-4">
          <div className="h-24 w-24 shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-600 p-[3px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#11151d]">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-2 sm:items-start">
            <Button variant="outline" className="w-full">
              Choose New Image
            </Button>
            <P>Upload a new profile image</P>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingProfile;
