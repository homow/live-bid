import Button from "@/Components/Ui/Button";
import { BadgeDollarSign } from "lucide-react";

const Header = () => {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        <BadgeDollarSign size={26} />

        <span className="h-5 w-px bg-slate-700" />
        <p className="text-sm font-medium text-indigo-400">Live Bid</p>
      </div>

      <nav>
        <ul className="flex items-center gap-8 text-sm font-medium">
          <li className="cursor-pointer  transition-colors duration-300 hover:text-indigo-400">
            Home
          </li>

          <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
            Auctions
          </li>

          <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
            Winners
          </li>

          <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
            How It Works?
          </li>
        </ul>
      </nav>
      <Button>sign in</Button>
    </header>
  );
};

export default Header;
