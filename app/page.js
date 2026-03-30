"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scissors,
  Calendar,
  Clock,
  Users,
  Star,
  ChevronRight,
  Languages,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, barbersRes, settingsRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/barbers"),
        fetch("/api/settings"),
      ]);

      const servicesData = await servicesRes.json();
      const barbersData = await barbersRes.json();
      const settingsData = await settingsRes.json();

      setServices(servicesData.services?.slice(0, 6) || []);
      setBarbers(barbersData.barbers?.slice(0, 3) || []);
      setSettings(settingsData.settings);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate with loader
  const handleNavigate = (path, label) => {
    setNavigating(label);
    router.push(path);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const translations = {
    en: {
      hero_title: "Premium Barbershop Experience",
      hero_subtitle: "Book your appointment with the best barbers in town",
      book_now: "Book Now",
      our_services: "Our Services",
      services_desc: "Professional grooming services for every style",
      view_all_services: "View All Services",
      our_barbers: "Meet Our Barbers",
      barbers_desc: "Skilled professionals dedicated to your style",
      view_all_barbers: "View All Barbers",
      why_choose: "Why Choose Us",
      expert_barbers: "Expert Barbers",
      expert_desc: "Experienced professionals with years of expertise",
      quality_service: "Quality Service",
      quality_desc: "Premium grooming products and techniques",
      easy_booking: "Easy Booking",
      easy_desc: "Book online in seconds, manage appointments easily",
      contact_us: "Get In Touch",
      address: "Visit Us",
      contact: "Contact",
      working_hours: "Working Hours",
      weekly_off: "Weekly Off",
      from: "From",
      min: "min",
      bookings: "bookings",
      rating: "Rating",
      years_exp: "years experience",
      view_map: "View on Google Maps",
      rights: "All rights reserved.",
    },
    hi: {
      hero_title: "प्रीमियम नाई की दुकान का अनुभव",
      hero_subtitle:
        "शहर के सर्वश्रेष्ठ नाइयों के साथ अपनी नियुक्ति बुक करें",
      book_now: "अभी बुक करें",
      our_services: "हमारी सेवाएं",
      services_desc: "हर स्टाइल के लिए पेशेवर ग्रूमिंग सेवाएं",
      view_all_services: "सभी सेवाएं देखें",
      our_barbers: "हमारे नाई से मिलें",
      barbers_desc: "आपकी शैली के लिए समर्पित कुशल पेशेवर",
      view_all_barbers: "सभी नाई देखें",
      why_choose: "हमें क्यों चुनें",
      expert_barbers: "विशेषज्ञ नाई",
      expert_desc: "वर्षों की विशेषज्ञता वाले अनुभवी पेशेवर",
      quality_service: "गुणवत्ता सेवा",
      quality_desc: "प्रीमियम ग्रूमिंग उत्पाद और तकनीक",
      easy_booking: "आसान बुकिंग",
      easy_desc:
        "सेकंडों में ऑनलाइन बुक करें, आसानी से अपॉइंटमेंट प्रबंधित करें",
      contact_us: "संपर्क करें",
      address: "हमसे मिलें",
      contact: "संपर्क",
      working_hours: "काम के घंटे",
      weekly_off: "साप्ताहिक अवकाश",
      from: "से",
      min: "मिनट",
      bookings: "बुकिंग",
      rating: "रेटिंग",
      years_exp: "साल का अनुभव",
      view_map: "गूगल मैप्स पर देखें",
      rights: "सर्वाधिकार सुरक्षित।",
    },
  };

  const t = translations[language];

  // ==================== Loading State ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ==================== Navigating Loader ====================
  if (navigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-slate-600">Loading {navigating}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* ==================== Header ==================== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Scissors className="h-7 w-7 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                {settings?.shopName || "FadeBook"}
              </h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-700 hover:text-blue-600 text-sm"
              >
                {language === "en" ? "Home" : "होम"}
              </Link>
              <button
                onClick={() => handleNavigate("/services", "Services")}
                className="text-slate-700 hover:text-blue-600 text-sm"
              >
                {language === "en" ? "Services" : "सेवाएं"}
              </button>
              <button
                onClick={() => handleNavigate("/barbers", "Barbers")}
                className="text-slate-700 hover:text-blue-600 text-sm"
              >
                {language === "en" ? "Barbers" : "नाई"}
              </button>
              <button
                onClick={() => handleNavigate("/gallery", "Gallery")}
                className="text-slate-700 hover:text-blue-600 text-sm"
              >
                {language === "en" ? "Gallery" : "गैलरी"}
              </button>
              <Button onClick={toggleLanguage} variant="outline" size="sm">
                <Languages className="h-4 w-4 mr-1" />
                {language === "en" ? "हिंदी" : "English"}
              </Button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleNavigate("/booking", "Booking")}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{t.book_now}</span>
                <span className="sm:hidden">Book</span>
              </Button>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  {user.role === "admin" && (
                    <Button
                      onClick={() => handleNavigate("/admin", "Admin")}
                      variant="outline"
                      size="sm"
                    >
                      Admin
                    </Button>
                  )}
                  {user.role === "barber" && (
                    <Button
                      onClick={() => handleNavigate("/barber", "Dashboard")}
                      variant="outline"
                      size="sm"
                    >
                      Dashboard
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      localStorage.removeItem("user");
                      setUser(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleNavigate("/login", "Login")}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t mt-3 pt-3 pb-2 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavigate("/services", "Services");
                }}
                className="block w-full text-left px-2 py-2 text-slate-700 hover:bg-slate-50 rounded"
              >
                {language === "en" ? "Services" : "सेवाएं"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavigate("/barbers", "Barbers");
                }}
                className="block w-full text-left px-2 py-2 text-slate-700 hover:bg-slate-50 rounded"
              >
                {language === "en" ? "Barbers" : "नाई"}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavigate("/gallery", "Gallery");
                }}
                className="block w-full text-left px-2 py-2 text-slate-700 hover:bg-slate-50 rounded"
              >
                {language === "en" ? "Gallery" : "गैलरी"}
              </button>

              <div className="flex items-center gap-2 px-2 pt-2">
                <Button
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Languages className="h-4 w-4 mr-1" />
                  {language === "en" ? "हिंदी" : "English"}
                </Button>

                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Button
                        onClick={() => handleNavigate("/admin", "Admin")}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Admin
                      </Button>
                    )}
                    {user.role === "barber" && (
                      <Button
                        onClick={() =>
                          handleNavigate("/barber", "Dashboard")
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Dashboard
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        localStorage.removeItem("user");
                        setUser(null);
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleNavigate("/login", "Login")}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ==================== Hero Section ==================== */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              {t.hero_title}
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-blue-100">
              {t.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                onClick={() => handleNavigate("/booking", "Booking")}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Calendar className="h-5 w-5 mr-2" />
                {t.book_now}
              </Button>
              <Button
                size="lg"
                onClick={() => handleNavigate("/services", "Services")}
                className="bg-white/10 text-white border border-white/30 hover:bg-white/20"
              >
                {t.view_all_services}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Services Section ==================== */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {t.our_services}
            </h3>
            <p className="text-slate-600">{t.services_desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {services.map((service) => (
              <Card
                key={service._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-700">
                      ₹{service.price}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration} {t.min}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => handleNavigate("/services", "Services")}
              variant="outline"
              size="lg"
            >
              {t.view_all_services}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== Barbers Section ==================== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {t.our_barbers}
            </h3>
            <p className="text-slate-600">{t.barbers_desc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {barbers.map((barber) => (
              <Card
                key={barber._id}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Users className="h-10 w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <CardTitle className="text-lg">{barber.name}</CardTitle>
                  <CardDescription>{barber.specialty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{barber.rating}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      {barber.experience} {t.years_exp}
                    </p>
                    <p className="text-xs text-slate-500">
                      {barber.totalBookings}+ {t.bookings}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => handleNavigate("/barbers", "Barbers")}
              variant="outline"
              size="lg"
            >
              {t.view_all_barbers}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== Why Choose Us ==================== */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-12">
            {t.why_choose}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {t.expert_barbers}
              </h4>
              <p className="text-slate-600 text-sm">{t.expert_desc}</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-7 w-7 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {t.quality_service}
              </h4>
              <p className="text-slate-600 text-sm">{t.quality_desc}</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-7 w-7 md:h-8 md:w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{t.easy_booking}</h4>
              <p className="text-slate-600 text-sm">{t.easy_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Contact Section ==================== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8 md:mb-12">
            {t.contact_us}
          </h3>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left — Contact Info */}
            <div className="space-y-4">
              {/* Address */}
              <Card>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t.address}</h4>
                    <p className="text-sm text-slate-600">
                      {settings?.address || "Address not available"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Phone */}
              <Card>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t.contact}</h4>
                    <p className="text-sm text-slate-600">
                      {settings?.phone || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-sm text-slate-600">
                      {settings?.email || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t.working_hours}</h4>
                    <p className="text-sm text-slate-600">
                      {settings?.workingHours?.start || "09:00"} -{" "}
                      {settings?.workingHours?.end || "21:00"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t.weekly_off}: {settings?.weeklyOff || "Monday"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right — Map */}
            <div className="h-full min-h-[300px] md:min-h-[400px]">
              <Card className="h-full overflow-hidden">
                <CardContent className="p-0 h-full">
                  {settings?.googleMapsLink ? (
                    <iframe
                      src={settings.googleMapsLink.replace(
                        "/maps/",
                        "/maps/embed/"
                      )}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "300px" }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-100 rounded-lg">
                      <MapPin className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 text-sm mb-3">
                        Map not available
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${encodeURIComponent(
                              settings?.address || "barbershop"
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {t.view_map}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Footer ==================== */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scissors className="h-6 w-6" />
                <span className="text-lg font-bold">
                  {settings?.shopName || "FadeBook"}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {t.hero_subtitle}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3">
                {language === "en" ? "Quick Links" : "त्वरित लिंक"}
              </h4>
              <div className="space-y-2 text-sm text-slate-400">
                <button
                  onClick={() => handleNavigate("/services", "Services")}
                  className="block hover:text-white"
                >
                  {language === "en" ? "Services" : "सेवाएं"}
                </button>
                <button
                  onClick={() => handleNavigate("/barbers", "Barbers")}
                  className="block hover:text-white"
                >
                  {language === "en" ? "Barbers" : "नाई"}
                </button>
                <button
                  onClick={() => handleNavigate("/booking", "Booking")}
                  className="block hover:text-white"
                >
                  {language === "en" ? "Book Appointment" : "अपॉइंटमेंट बुक करें"}
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">{t.contact}</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {settings?.phone || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {settings?.email || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {settings?.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-500">
            © {new Date().getFullYear()}{" "}
            {settings?.shopName || "FadeBook"}. {t.rights}
          </div>
        </div>
      </footer>
    </div>
  );
}