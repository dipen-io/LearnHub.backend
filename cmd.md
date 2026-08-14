# Local dev 
add table/column

> Step 1: Create migration SQL file (no DB touched)
npx drizzle-kit generate

> Step 2: Apply to your LOCAL database (playground)
npx drizzle-kit push

# ready for production
> Step 1: Generate migration file (if you haven't already)
npx drizzle-kit generate

> Step 2: Run migrations on PRODUCTION database
npx drizzle-kit migrate

# Auto-export all vars from .env
set -a
source /path/to/your/project/.env
set +a

echo $LOCAL_DB_URL
psql "$LOCAL_DB_URL" -c "\dt"

psql "$LOCAL_DB_URL" -c "SELECT * FROM banners LIMIT 1;"