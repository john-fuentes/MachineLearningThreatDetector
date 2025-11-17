import Link from "next/link";

export function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
    const links = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/dashboard", label: "Dashboard" },
    ];
    return (
        <ul className="space-y-1">
            {links.map((l) => (
                <li key={l.href}>
                    <Link
                        href={l.href}
                        onClick={onNavigate}
                        className="block rounded-md px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        {l.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}


