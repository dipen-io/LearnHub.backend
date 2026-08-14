CREATE TYPE "public"."banner_platform" AS ENUM('all', 'ios', 'android');--> statement-breakpoint
CREATE TYPE "public"."banner_position" AS ENUM('home_top', 'home_middle', 'explore_header', 'profile_banner', 'my_learning_top');--> statement-breakpoint
CREATE TYPE "public"."banner_type" AS ENUM('hero_carousel', 'promo_strip', 'announcement', 'course_featured', 'category_pills');--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM('all', 'guests', 'logged_in', 'new_users', 'returning');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "banner_type" NOT NULL,
	"position" "banner_position" NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"platform" "banner_platform" DEFAULT 'all' NOT NULL,
	"app_version_min" varchar(20),
	"app_version_max" varchar(20),
	"target_audience" "target_audience" DEFAULT 'all' NOT NULL,
	"target_categories" jsonb,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"content" jsonb NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "is_active" SET DEFAULT false;