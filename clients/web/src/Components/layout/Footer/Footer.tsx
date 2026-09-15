import { Separator } from "@/Components/Ui/separator";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterBottom from "./FooterBottom";

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#11151d] text-[#a1a7b8]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <FooterBrand />
          <FooterLinks />
        </div>

        <Separator className="mt-12 bg-slate-800" />

        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;