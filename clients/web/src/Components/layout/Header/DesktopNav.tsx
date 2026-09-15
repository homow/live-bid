import Link from "next/link";

import { navigationItems } from "./navigation";

const DesktopNav = () => {
  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-8">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-indigo-400"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopNav;