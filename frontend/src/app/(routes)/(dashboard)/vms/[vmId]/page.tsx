import { auth } from "@/auth";
import VmAnalysisClient from "./VmAnalysisClient";

export default async function VmAnalysisPage({ params }: { params: { vmId: string } }) {
    const session = await auth();
    const user = session?.user;
    const customerId = user?.id || ""; // depends on your session structure

    return <VmAnalysisClient vmId={params.vmId} customerId={customerId} />;
}
