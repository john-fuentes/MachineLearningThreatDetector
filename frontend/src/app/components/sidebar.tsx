"use client";

import { useState } from "react";
import { SidebarLinks } from "./nav-links";

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 lg:hidden"
            >
                ☰
            </button>
            {open && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-base font-semibold">Menu</div>
                            <button
                                type="button"
                                aria-label="Close menu"
                                onClick={() => setOpen(false)}
                                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                        <SidebarLinks onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}
        </>
    );
}


