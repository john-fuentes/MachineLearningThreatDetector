export default function AboutPage() {
    return (
        <section className="mx-auto max-w-4xl px-4 py-12 space-y-6">
            <h1 className="text-3xl font-semibold">About Secunix</h1>
            <p className="text-muted-foreground">
                Secunix is a business-to-business frontend prototype for Linux user anomaly
                detection. We help security teams visualize suspicious login behavior,
                sudden privilege changes, and atypical access patterns so they can act fast.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border p-5">
                    <h2 className="text-lg font-medium">Why Secunix</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Reduce time-to-detection by surfacing risky user sessions and unusual
                        command activity in one place.
                    </p>
                </div>
                <div className="rounded-lg border p-5">
                    <h2 className="text-lg font-medium">B2B Ready</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Built for teams: clear dashboards, enterprise-oriented navigation, and
                        an approachable information architecture.
                    </p>
                </div>
            </div>
            <div className="rounded-lg bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Why Linux security matters</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    <li>Linux powers critical infrastructure—servers, containers, and CI/CD runners. A single compromised user can escalate quickly.</li>
                    <li>User behavior is the earliest signal: unusual logins, privilege jumps, and atypical hosts often precede breaches.</li>
                    <li>Traditional logs are noisy. Visual summaries and severity cues help teams prioritize what to investigate first.</li>
                </ul>
            </div>
        </section>
    );
}


