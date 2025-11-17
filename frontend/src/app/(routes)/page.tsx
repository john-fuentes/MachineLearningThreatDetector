import Link from "next/link";

export default function Home() {
    return (
        <>
            {/* Hero (full-bleed) */}
            <section className="w-full bg-gradient-to-b from-[rgb(var(--color-primary))/10] to-transparent">
                <div className="mx-auto max-w-6xl px-4 py-20">
                    <div className="max-w-3xl space-y-6">
                        <h1 className="text-5xl font-semibold leading-tight">
                            Secunix — B2B anomaly detection for Linux user activity
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Reduce time-to-detection with clear insights into logins, privilege changes, and risky sessions. Built for security teams.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/about" className="inline-flex items-center rounded-md border bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90">Learn about Secunix</Link>
                            <Link href="/features" className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm hover:bg-gray-50">See features</Link>
                            <Link href="/signin" className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm hover:bg-gray-50">Sign in</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value props (wide, fewer boxes) */}
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-4 py-16">
                    <div className="grid gap-10 md:grid-cols-3">
                        <div>
                            <h2 className="text-2xl font-semibold">Visibility</h2>
                            <p className="mt-2 text-muted-foreground">Role-based views make it easy for admins and analysts to focus on what matters.</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold">Speed</h2>
                            <p className="mt-2 text-muted-foreground">See anomalies as trends, not just rows. Prioritize high-severity events first.</p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold">Fit for teams</h2>
                            <p className="mt-2 text-muted-foreground">Clean UI, simple navigation, and a dashboard designed for collaboration.</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

