export default function FeaturesPage() {
    const features = [
        {
            title: "User Session Analytics",
            desc: "Summaries of SSH/TTY sessions highlighting unusual patterns.",
        },
        { title: "Privilege Escalation Hints", desc: "Flag risky sudo activity." },
        { title: "Location & ASN Context", desc: "Spot improbable logins at a glance." },
        { title: "Team-friendly UI", desc: "Clean navigation and simple tables." },
    ];

    return (
        <section className="mx-auto max-w-5xl px-4 py-12">
            <h1 className="text-3xl font-semibold">Features</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                A lightweight B2B-style frontend for Linux user anomaly detection.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {features.map((f) => (
                    <div key={f.title} className="rounded-lg border p-5">
                        <h2 className="text-lg font-medium">{f.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}


