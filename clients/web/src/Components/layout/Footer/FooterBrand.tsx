import { BadgeDollarSign } from "lucide-react";
import { Separator } from "@/Components/Ui/separator";
import FooterSocials from "./FooterSocials";

const FooterBrand = () => {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center gap-3">
        <BadgeDollarSign size={26} />

        <Separator orientation="vertical" className="h-5 bg-slate-700" />

        <p className="font-medium text-indigo-400">Live Bid</p>
      </div>

      <p className="mt-5 max-w-md text-sm leading-7 text-[#a1a7b8]">
        Join live auctions, discover unique products, and compete to win.
      </p>

      <p className="mt-4 text-sm font-semibold text-indigo-400">
        Bid. Win. Own.
      </p>

      <FooterSocials />
    </div>
  );
};

export default FooterBrand;
