
const API_BASE_URL = process.env.NEXT_PRIVATE_API_URL || "http://localhost:5000";

export async function getMLResults(userId:number, vmId:number, date: string, start_time: string, end_time:string){


    const params = new URLSearchParams({
        customer_id: userId.toString(),
        vm_id: vmId.toString(),
        date,
        start_time,
        end_time,
    });


    const res = await fetch(`${API_BASE_URL}/ml/results?${params.toString()}`, {
        method: "GET"
    })
    if(!res.ok){
        throw new Error(`Error fetching logs: ${res.status}`)
    }

    return await res.json()
}

export async function getRawLogs(userId:number, vmId:number, date: string, start_time: string, end_time:string){


    const params = new URLSearchParams({
        customer_id: userId.toString(),
        vm_id: vmId.toString(),
        date,
        start_time,
        end_time,
    });

    const res = await fetch(`${API_BASE_URL}/logs/unprocessed?${params.toString()}`, {
        method: "GET"
    })
    if(!res.ok){
        throw new Error(`Error fetching logs: ${res.status}`)
    }

    return await res.json()
}