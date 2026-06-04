"use client"

import { useState, useEffect } from "react"
import {
  Star,
  Send,
  MessageSquare,
  User,
  Mail,
  Pencil,
  Trash2,
  X,
  Check,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Review {
  id: number
  name: string
  email: string
  rating: number
  message: string
  createdAt: string
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "sm",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md"
}) {
  const s = size === "md" ? "h-5 w-5" : "h-4 w-4"
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <Star
            className={`${s} ${
              star <= value
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function SectionReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState({ name: "", email: "", rating: 0, message: "" })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", rating: 0, message: "" })

  const [verifyEmail, setVerifyEmail] = useState("")
  const [verifyTarget, setVerifyTarget] = useState<{ id: number; action: "edit" | "delete" } | null>(null)
  const [verifyError, setVerifyError] = useState("")

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.rating || !form.message) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to submit")
      const review: Review = await res.json()
      setReviews((prev) => [review, ...prev])
      setForm({ name: "", email: "", rating: 0, message: "" })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(review: Review) {
    setEditForm({
      name: review.name,
      email: review.email,
      rating: review.rating,
      message: review.message,
    })
    setEditingId(review.id)
    setVerifyTarget(null)
    setVerifyEmail("")
  }

  async function handleUpdate() {
    if (!editingId) return
    try {
      const res = await fetch(`/api/reviews/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error("Failed to update")
      const updated: Review = await res.json()
      setReviews((prev) => prev.map((r) => (r.id === editingId ? updated : r)))
      setEditingId(null)
    } catch {
      setError("Failed to update review")
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail }),
      })
      if (!res.ok) throw new Error("Failed to delete")
      setReviews((prev) => prev.filter((r) => r.id !== id))
      setVerifyTarget(null)
      setVerifyEmail("")
    } catch {
      setVerifyError("Failed to delete. Check your email.")
    }
  }

  function promptVerify(id: number, action: "edit" | "delete") {
    setVerifyTarget({ id, action })
    setVerifyEmail("")
    setVerifyError("")
  }

  function handleVerify() {
    if (!verifyTarget) return
    const review = reviews.find((r) => r.id === verifyTarget.id)
    if (!review) return

    if (review.email !== verifyEmail) {
      setVerifyError("Email does not match the review owner.")
      return
    }

    if (verifyTarget.action === "edit") {
      startEdit(review)
    } else {
      handleDelete(verifyTarget.id)
    }
  }

  return (
    <section id="reviews" className="border-t border-border/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            What Users Say
          </h2>
          <p className="mt-4 text-muted-foreground">
            Hear from the NeoArch community.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <Card className="h-fit border-border/50 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4 text-primary" />
                Leave a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <User className="h-3 w-3" />
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Star className="h-3 w-3" />
                    Rating
                  </label>
                  <StarRating
                    value={form.rating}
                    onChange={(v) => setForm({ ...form, rating: v })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-2"
                  />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                {submitted && (
                  <p className="text-xs text-green-500">
                    Review submitted successfully!
                  </p>
                )}

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : (
                    <>
                      Send Review
                      <Send className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="glass flex flex-col items-center justify-center rounded-xl py-16 text-center shadow-sm">
                <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No reviews yet. Be the first!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="border-border/50 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                  <CardContent className="pt-4">
                    {editingId === review.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Edit Review</h4>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Name"
                          className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary/50 focus:ring-2"
                        />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Email"
                          className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary/50 focus:ring-2"
                        />
                        <StarRating
                          value={editForm.rating}
                          onChange={(v) => setEditForm({ ...editForm, rating: v })}
                          size="md"
                        />
                        <textarea
                          value={editForm.message}
                          onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                          placeholder="Message"
                          rows={3}
                          className="w-full resize-none rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:border-primary/50 focus:ring-2"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdate}>
                            <Check className="mr-1 h-3 w-3" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{review.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <StarRating value={review.rating} readonly />
                            <button
                              onClick={() => promptVerify(review.id, "edit")}
                              className="ml-1 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-accent hover:text-foreground"
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => promptVerify(review.id, "delete")}
                              className="rounded p-1 text-muted-foreground/40 transition-colors hover:bg-accent hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.message}
                        </p>
                      </>
                    )}

                    {verifyTarget && verifyTarget.id === review.id && (
                      <div className="mt-3 rounded-lg border border-border/50 bg-muted/50 p-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          Enter your email to {verifyTarget.action}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={verifyEmail}
                            onChange={(e) => setVerifyEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs outline-none ring-primary/30 focus:border-primary/50 focus:ring-2"
                          />
                          <Button size="sm" onClick={handleVerify}>
                            <Check className="mr-1 h-3 w-3" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVerifyTarget(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {verifyError && (
                          <p className="mt-1 text-xs text-red-500">{verifyError}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
