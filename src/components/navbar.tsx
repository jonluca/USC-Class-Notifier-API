import Link from "next/link";

export const Navbar = () => {
  return (
    <nav
      className={`h-16 max-h-16 bg-white drop-shadow-sm sticky top-0 z-50 px-4 rounded-b-2xl mx-auto max-w-7xl w-full flex flex-shrink flex-grow items-center overflow-hidden transition-all duration-300 ease-in-out justify-between`}
    >
      {/* Logo */}
      <Link href="/" className="rounded-lg px-1 py-1.5">
        USC Schedule Helper
      </Link>
      <Link href="/faq" className="rounded-lg px-1 py-1.5">
        FAQ
      </Link>
    </nav>
  );
};
