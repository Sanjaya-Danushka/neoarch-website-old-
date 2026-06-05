import { NextResponse } from "next/server"
import { db } from "@/db/index"
import { reviews } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const all = await db.select().from(reviews).orderBy(desc(reviews.createdAt))
    return NextResponse.json(all)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, rating, message } = body
    const [review] = await db
      .insert(reviews)
      .values({ name, email, rating, message })
      .returning()
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    )
  }
}
