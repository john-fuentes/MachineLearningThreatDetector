import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MobileSidebar } from "./sidebar";
import {auth, signOut} from "@/auth";

export default async function Navbar (){
    const session = await auth()

    return(
        <nav className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-lg font-semibold">Secunix</Link>
                    <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">role</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="hidden lg:flex items-center gap-4">
                        <Link href="/features" className="hover:underline">Features</Link>
                        <Link href="/about" className="hover:underline">About</Link>
                        <Link href="/contact" className="hover:underline">Contact</Link>
                        <Link href="/vms" className="hover:underline">Dashboard</Link>
                    </div>
                    <ThemeToggle />
                    {session ?
                        (<form action={async()=>{
                            "use server";
                            await signOut()
                        }

                        }>
                            <button className="hidden lg:inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-gray-50">Logout</button>
                        </form>):
                        (<Link href="/signin" className="hidden lg:inline-flex items-center rounded-md border px-3 py-1.5 hover:bg-gray-50">Login</Link>)

                    }
                    <MobileSidebar />
                </div>
            </div>
        </nav>
    )
};