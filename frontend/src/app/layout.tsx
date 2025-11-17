import "./globals.css";
import Navbar from "@/app/components/navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
            <Navbar />
            <main>{children}</main>

        </body>
        </html>
    );
}
