import { NextResponse } from "next/server"
import { db } from "@/db/index"
import { reviews } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt))
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, rating, message } = await req.json()
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
