CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"rating" integer NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
