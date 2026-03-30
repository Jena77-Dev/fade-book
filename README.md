# FadeBook - Barbershop Booking System

A complete, production-ready full-stack barbershop booking application built for Indian barbershops with modern tech stack.

## 🚀 Features

### Customer Features
- **Homepage**: Beautiful landing page with services, barbers, and contact info
- **Online Booking System**: 4-step booking flow
  - Select Service
  - Choose Barber
  - Pick Date & Time with real-time availability
  - Enter contact details and confirm
- **Services Page**: Browse all services with pricing
- **Barbers Page**: Meet the team with profiles and ratings
- **Gallery**: View before-after transformations
- **Bilingual Support**: English + Hindi language toggle

### Admin Dashboard (`/admin`)
- **Dashboard Overview**: Today's appointments, revenue, stats
- **Appointments Management**: View, confirm, complete, or cancel bookings
- **Barbers Management**: Add, edit, remove barbers
- **Services Management**: CRUD operations for services
- **Customers Database**: View all clients with visit history
- **Shop Settings**: Configure shop details, hours, contact info

### Barber Dashboard (`/barber`)
- View today's schedule
- Mark appointments as in-progress or completed
- Track daily performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + React
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Form Validation**: React Hook Form + Zod (ready to integrate)

## 📁 Project Structure

```
/app
├── app/
│   ├── page.js                 # Homepage
│   ├── layout.js               # Root layout
│   ├── globals.css             # Global styles
│   ├── booking/page.js         # Booking flow
│   ├── services/page.js        # Services listing
│   ├── barbers/page.js         # Barbers listing
│   ├── gallery/page.js         # Gallery page
│   ├── admin/page.js           # Admin dashboard
│   ├── barber/page.js          # Barber dashboard
│   └── api/[[...path]]/route.js # Backend API
├── components/ui/              # shadcn components
├── lib/                        # Utilities
├── seed.js                     # Database seeding script
└── .env                        # Environment variables
```

## 🗄️ Database Collections

1. **services** - Services offered (haircut, shave, etc.)
2. **barbers** - Barber profiles with specialties
3. **appointments** - Booking records
4. **customers** - Client database
5. **gallery** - Before/after images
6. **settings** - Shop configuration
7. **users** - Admin/Barber accounts (for future auth)

## 🔐 Authentication System

The application now includes a complete authentication system for all user roles:

### User Roles:
1. **Customer** - Can book appointments and view booking history
2. **Barber** - Can view and manage their daily schedule
3. **Admin** - Full access to manage shop, services, barbers, and appointments

### Demo Credentials:
- **Admin**: `admin@fadebook.com` / `admin123`
- **Barber**: `barber@fadebook.com` / `barber123`
- **Customer**: `customer@fadebook.com` / `customer123`

### Features:
- ✅ Login & Registration for all roles
- ✅ Role-based access control (protected routes)
- ✅ Customer booking history (`/my-bookings`)
- ✅ Automatic user info pre-fill in booking form
- ✅ Login/Logout buttons in navigation
- ✅ Session persistence with localStorage

## 🚀 Getting Started

### 1. Start the Application
```bash
sudo supervisorctl restart all
```

### 2. Seed Sample Data
```bash
cd /app && node seed.js
```

### 3. Access the Application
- **Customer Site**: https://fade-book-app.preview.emergentagent.com
- **Admin Dashboard**: https://fade-book-app.preview.emergentagent.com/admin
- **Barber Dashboard**: https://fade-book-app.preview.emergentagent.com/barber

## 📊 Sample Data

The seed script populates:
- **8 Services**: Regular Haircut (₹200), Fade Cut (₹300), Beard Trim (₹150), Shave (₹100), Hair Color (₹800), Head Massage (₹150), Kids Haircut (₹150), Bridal Package (₹1500)
- **4 Barbers**: Rajesh Kumar, Amit Sharma, Vikram Singh, Suresh Patel, Mukesh Vishe, Pravin Bhatt

## 🔗 API Endpoints

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Barbers
- `GET /api/barbers` - Get all barbers
- `POST /api/barbers` - Create barber
- `PUT /api/barbers/:id` - Update barber
- `DELETE /api/barbers/:id` - Deactivate barber

### Appointments
- `GET /api/appointments` - Get all appointments (with filters)
- `POST /api/appointments` - Create booking
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

### Availability
- `GET /api/availability?barberId=X&date=YYYY-MM-DD` - Get available slots

### Dashboard
- `GET /api/dashboard/stats` - Get admin dashboard statistics

### Barber Dashboard
-`GET /api/barber/profile?email`
-`GET /api/barber/stats?barberId`
-`GET /api/barber/schedule?barberId&date`
-`GET /api/barber/earnings?barberId&period=month`
-`PUT /api/appointments/:id  → { status: "completed" }`

### Settings
- `GET /api/settings` - Get shop settings
- `PUT /api/settings` - Update shop settings

## 🎨 Key Features Implemented

✅ Multi-barber support with individual calendars
✅ Real-time slot availability checking
✅ 30-minute time slot intervals (9 AM - 8 PM)
✅ Booking status workflow (pending → confirmed → in-progress → completed)
✅ Mobile-first responsive design
✅ Bilingual UI (English + Hindi)
✅ Admin dashboard with full CRUD operations
✅ Barber dashboard for appointment tracking
✅ Revenue tracking and statistics
✅ Customer database with visit history

## 💳 Payment Integration (UI Ready)

The payment UI is built and ready. To enable Razorpay:
1. Get Razorpay API keys from https://razorpay.com
2. Add to `.env`: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
3. Integrate Razorpay SDK in booking flow

## 📱 WhatsApp/SMS Notifications (UI Ready)

Confirmation messages are displayed. To enable real notifications:
1. For WhatsApp: Use Twilio or WhatsApp Business API
2. For SMS: Use Textlocal, MSG91, or Twilio
3. Add credentials to `.env`
4. Implement in `/api/appointments` POST endpoint

## 🖼️ Image Upload

Gallery page is ready. To enable uploads:
1. Use Cloudinary for image storage
2. Add credentials to `.env`
3. Implement upload endpoint in admin

## 🔐 Authentication (Future Enhancement)

Basic structure is in place. To add full authentication:
1. Implement NextAuth.js v5
2. Add login/register pages
3. Protect admin/barber routes
4. Add session management

## 🌐 Deployment

The app is already running and accessible at:
- https://fade-book-app.preview.emergentagent.com

## 📝 Environment Variables

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=barbershop_db
NEXT_PUBLIC_BASE_URL=https://fade-book-app.preview.emergentagent.com
CORS_ORIGINS=*
```

## 🎯 Next Steps for Production

1. **Authentication**: Implement NextAuth.js with phone OTP
2. **Payment Gateway**: Integrate Razorpay for advance payments
3. **Notifications**: Set up WhatsApp/SMS via Twilio
4. **Image Storage**: Connect Cloudinary for gallery uploads
5. **SEO**: Add meta tags, sitemap, robots.txt
6. **Analytics**: Integrate Google Analytics
7. **PWA**: Add service worker for offline support
8. **Testing**: Add comprehensive tests

## 🐛 Known Limitations (MVP)

- No authentication system (anyone can access admin)
- Payment is UI-only (no real integration)
- Notifications are placeholder messages
- Gallery uses placeholder icons (no real image uploads)
- No email confirmation system
- No review/rating system for customers
- No barber availability management (assumes 9-8 daily)

## 📞 Support

For questions or issues, contact the shop admin or developer.

## 📄 License

Proprietary - Built for FadeBook Barbershop

---

**Built with ❤️ for Indian Barbershops by jenaDev** 🇮🇳
