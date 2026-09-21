import { BadgeDollarSign } from "lucide-react";

import { Separator } from "@/Components/Ui/separator";
import { Span } from "@/Components/Ui/typography/typography";

const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-3">
      <BadgeDollarSign size={26} className="text-indigo-400" />
      <Separator orientation="vertical" className="h-5 bg-slate-700" />
      <Span className="text-indigo-400">Live Bid</Span>
    </div>
  );
};

export default HeaderLogo;
