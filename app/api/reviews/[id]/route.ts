import { NextResponse } from "next/server"
import { db } from "@/db/index"
import { reviews } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, Number(id)))

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (existing.email !== body.email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 })
    }

    const [updated] = await db
      .update(reviews)
      .set({
        name: body.name,
        rating: body.rating,
        message: body.message,
      })
      .where(eq(reviews.id, Number(id)))
      .returning()

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { email } = await req.json()

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, Number(id)))

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (existing.email !== email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 })
    }

    await db.delete(reviews).where(eq(reviews.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 },
    )
  }
}
