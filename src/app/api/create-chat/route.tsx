import { loadS3IntoPineCone } from "@/lib/Pincone";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response){
    try {
        const body = await req.json()
        const {file_key, file_name} = body
        console.log(file_key + ": " + file_name)
        const pages = await loadS3IntoPineCone(file_key)
        return NextResponse.json({pages})
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:"Internal Server error"},{status: 500})
    }
}