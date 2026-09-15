import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FooterLinks = () => {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
        Quick Links
      </h3>

      <ul className="mt-5 space-y-3 text-sm">
        <li>
          <Link href="/" className="transition-colors hover:text-indigo-400">
            Home
          </Link>
        </li>

        <li>
          <Link
            href="/auctions"
            className="transition-colors hover:text-indigo-400"
          >
            Auctions
          </Link>
        </li>

        <li>
          <Link
            href="/How-to-Work"
            className="transition-colors hover:text-indigo-400"
          >
            How It Works
          </Link>
        </li>
      </ul>

      <div className="mt-8">
        <p className="text-sm font-semibold text-white">
          Ready to start bidding?
        </p>

        <Link
          href="/auctions"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition-all duration-300 hover:gap-3 hover:text-indigo-300"
        >
          Explore Auctions
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default FooterLinks;
