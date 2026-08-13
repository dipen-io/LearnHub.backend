### API 

   ##### public
    * GET /banners?position=home_top&platform=ios&version=1.20
        fetch active banner for a specifi screen slot
    * POST /banners/:id/tract   
        Fire-and-forgot imporession/click analytics

   ##### private
    * POST /admin/banners  
        create new banner
    * PATCH /admin/banners/:id   
        edit content, schedule, targeting
    * DELETE /admin/banners/:id 
        remove banners
    * POST  /admin/banners/:id/toggle 
        quick enable/disable banners
    * GET /admin/banners  
        list with filter , (position, status, date range)
    * POSt /admin/banners/reorder
        drag-and-drop priority update

### Date Model
    
    id: UUID   
    name: string internal for admin
    type : enum [hero_carousel, promo_strip, announcement, course_features, category_pill]
    position: enum (home_top, home_middle, explore_header, profile_banner, my_learning_top)
    priority: enum (Display order 0 = first)
    isActive: boolean (live or draft)
    platform : enum [all, ios, android]
    appVersionMin:  string (Optional only show if app version is > = this)
    appVersionMax: string(optional only show if app version is =< this)
    startAt: ISO datetime(when to start showing)
    endAt: ISO datetime (when to stop showing)
    taregetAudience: enum[all, guest, logged_in, new_users, returning]
    taegetCategories: string[] (only show to interested categories)
    content : JSONB/object (The flexible payload -- see below)
    impressions: integer (auto- incremented)
    clicks : integer (Auto-increment)
    createdAt: timestamp
    updatedAt: timestamp

### Flexible Content Schema 
    * instead of imageUrl, title, subtitle, Store a JSON content field
    whole shape depends on type.

    > Example: hero_carousel

    {
        "type": "hero_carousel",
        "content": {
            "autoPlayInterval": 5000,
            "showIndicators": true,
            "slides": [
            {
                "imageUrl": "https://cdn.../banner1.jpg",
                "title": "Master React Native",
                "subtitle": "Build apps for iOS & Android",
                "bgColor": "#2F4F3E",
                "textColor": "#FFFFFF",
                "cta": {
                "label": "Start Learning",
                "action": { "type": "screen", "value": "/course/abc-123" }
                }
            },
            {
                "imageUrl": "https://cdn.../banner2.jpg",
                "title": "50% Off Weekend",
                "subtitle": "All premium courses",
                "cta": {
                "label": "Browse",
                "action": { "type": "screen", "value": "/explore" }
                }
            }
            ]
        }
    } 

    Example: promo_strip
    {
        "type": "promo_strip",
        "content": {
            "message": "New courses added in Design",
            "bgColor": "#F2A93B",
            "textColor": "#1C2321",
            "icon": "sparkles",
            "dismissible": true,
            "cta": {
            "label": "See All",
            "action": { "type": "screen", "value": "/explore?category=design" }
            }
        }
    }

    Example: announcement

    {
        "type": "announcement",
        "content": {
            "message": "App maintenance tonight 2-4 AM IST",
            "severity": "warning",
            "dismissible": true,
            "action": { "type": "none" }
        }
    }

    Example: course_featured
    {
        "type": "course_featured",
        "content": {
            "layout": "horizontal_scroll",
            "title": "Trending Now",
            "courseIds": ["course-001", "course-002", "course-003"]
        }
    }

#### Caching Strategy
    Backend: Cache the active banner query in Redis for 2-5 minutes. Invalidate on any banner mutation.
    App: Cache the /banners response for 1-2 minutes. Show stale data while revalidating in background.

#### Admin Dashboard Features You'll Want
    Live preview of banner on phone mockup
    Drag-and-drop reordering (updates priority)
    Duplicate banner (clone for quick edits)
    Schedule calendar (see what's live when)
    Analytics per banner: impressions, clicks, CTR
    A/B test builder (create variants, set traffic %)