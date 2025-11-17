export default function ContactPage() {
    const team = [
        {
            name: "Noor Al Huda",
            role: "Project Lead & Software Engineer",
            email: "aalhuda@students.kennesaw.edu",
            img: "https://api.dicebear.com/7.x/initials/svg?seed=Noor%20Al%20Huda",
            bio: "Leads planning and delivery, aligning requirements with secure, scalable solutions.",
            linkedin: "https://www.linkedin.com/in/noor-al-huda",
        },
        {
            name: "John Fuentes",
            role: "Backend Engineer",
            email: "jfuent16@students.kennesaw.edu",
            img: "https://api.dicebear.com/7.x/initials/svg?seed=John%20Fuentes",
            bio: "Develops APIs and data ingestion for Linux logs and anomaly scoring.",
            linkedin: "https://www.linkedin.com/in/john-fuentes",
        },
        {
            name: "Katheryn Robles",
            role: "Technical Documenter",
            email: "krobles4@students.kennesaw.edu",
            img: "https://api.dicebear.com/7.x/initials/svg?seed=Katheryn%20Robles",
            bio: "Creates clear documentation and supports validation of user workflows.",
            linkedin: "https://www.linkedin.com/in/katheryn-robles",
        },
        {
            name: "Geovanni Cuevas",
            role: "Frontend Engineer",
            email: "gcuevas@students.kennesaw.edu",
            img: "https://api.dicebear.com/7.x/initials/svg?seed=Geovanni%20Cuevas",
            bio: "Builds the Secunix UI and data visualizations with an emphasis on UX.",
            linkedin: "https://www.linkedin.com/in/geovanni-cuevas",
        },
    ];

    return (
        <section className="mx-auto max-w-5xl px-4 py-12">
            <h1 className="text-3xl font-semibold">Contact</h1>
            <p className="mt-2 text-sm text-muted-foreground">Reach the Secunix team.</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {team.map((m) => (
                    <div key={m.email} className="rounded-lg border p-5">
                        <div className="flex items-start gap-4">
                            <img
                                src={m.img}
                                alt={`${m.name} avatar`}
                                className="h-14 w-14 rounded-full border object-cover"
                                loading="lazy"
                            />
                            <div>
                                <h2 className="text-lg font-medium">{m.name}</h2>
                                <p className="text-sm text-muted-foreground">{m.role}</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                            <a href={`mailto:${m.email}`} className="inline-flex text-sm underline">
                                {m.email}
                            </a>
                            {m.linkedin && (
                                <a
                                    href={m.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                                >
                                    Connect on LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

