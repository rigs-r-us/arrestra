import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({ orderBy: { arrestTime: "desc" }, take: 50 });
  return NextResponse.json(leads);
}
