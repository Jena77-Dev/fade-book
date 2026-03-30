"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scissors,
  Calendar,
  Clock,
  User,
  IndianRupee,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function BarberPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [barber, setBarber] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // ==================== Auth Check ====================
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "barber") {
      alert("Access denied. Barber only.");
      router.push("/");
      return;
    }

    setUser(parsedUser);
    fetchBarberProfile(parsedUser.email);
  }, []);

  // ==================== Fetch schedule on date/barber change ====================
  useEffect(() => {
    if (barber?._id) {
      fetchSchedule();
    }
  }, [barber, selectedDate]);

  // ==================== API Calls ====================
  const fetchBarberProfile = async (email) => {
    try {
      const response = await fetch(`/api/barber/profile?email=${email}`);
      const data = await response.json();
      if (data.success) {
        setBarber(data.barber);
      } else {
        alert("Barber profile not found");
        router.push("/login");
      }
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/barber/schedule?barberId=${barber._id}&date=${dateStr}`
      );
      const data = await response.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Schedule error:", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchSchedule();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // ==================== Helpers ====================
  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const completedCount = appointments.filter(
    (a) => a.status === "completed"
  ).length;
  const pendingCount = appointments.filter((a) =>
    ["confirmed", "pending"].includes(a.status)
  ).length;

  // ==================== Loading ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Scissors className="h-12 w-12 text-blue-600 animate-pulse" />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">Barber profile not found</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </Card>
      </div>
    );
  }



  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================== Header ==================== */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              <div>
                <h1 className="text-sm sm:text-base md:text-lg font-bold leading-tight">
                  Barber Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-tight">
                  Welcome, {barber?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Back to Site</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/login");
                }}
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* ==================== Stats Cards ==================== */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          <Card className="shadow-sm">
            <div className="p-2 sm:p-3 md:p-4">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate leading-tight">
                Today&apos;s Appointments
              </p>
              <p className="text-base sm:text-xl md:text-2xl font-bold mt-0.5">
                {appointments.length}
              </p>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="p-2 sm:p-3 md:p-4">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate leading-tight">
                Completed
              </p>
              <p className="text-base sm:text-xl md:text-2xl font-bold text-green-600 mt-0.5">
                {completedCount}
              </p>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="p-2 sm:p-3 md:p-4">
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate leading-tight">
                Pending
              </p>
              <p className="text-base sm:text-xl md:text-2xl font-bold text-yellow-600 mt-0.5">
                {pendingCount}
              </p>
            </div>
          </Card>
        </div>

        {/* ==================== Date Navigation ==================== */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(-1)}
            className="h-7 sm:h-8 w-7 sm:w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h2 className="text-xs sm:text-sm md:text-base font-semibold leading-tight">
              {selectedDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </h2>
            {isToday ? (
              <Badge className="bg-green-100 text-green-700 mt-0.5 text-[9px] sm:text-[10px] px-1.5 py-0">
                Today
              </Badge>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="text-blue-600 mt-0 p-0 h-auto text-[10px] sm:text-xs"
                onClick={() => setSelectedDate(new Date())}
              >
                Go to Today
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate(1)}
            className="h-7 sm:h-8 w-7 sm:w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* ==================== Schedule ==================== */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mb-2 sm:mb-3">
            {isToday ? "Today's" : "Day's"} Schedule ({appointments.length})
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <Card
                key={apt._id}
                className={`shadow-sm overflow-hidden ${
                  apt.status === "completed"
                    ? "border-green-200 bg-green-50/40"
                    : apt.status === "cancelled"
                    ? "border-red-200 bg-red-50/40"
                    : apt.status === "in-progress"
                    ? "border-yellow-200 bg-yellow-50/40"
                    : ""
                }`}
              >
                <div className="p-2.5 sm:p-3 md:p-4">
                  {/* Header Row */}
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] sm:text-[10px] bg-slate-200 px-1 sm:px-1.5 py-0.5 rounded font-mono font-semibold flex-shrink-0">
                        #{apt.serialNumber}
                      </span>
                      <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <h3 className="font-semibold text-xs sm:text-sm truncate">
                        {apt.customerName}
                      </h3>
                      <span className="text-[10px] sm:text-xs text-slate-400 flex-shrink-0 hidden sm:inline">
                        • {apt.customerPhone}
                      </span>
                    </div>
                    <Badge
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 flex-shrink-0 ${
                        apt.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : apt.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {apt.status}
                    </Badge>
                  </div>

                  {/* Phone - mobile only */}
                  <p className="text-[10px] text-slate-400 mb-1.5 sm:hidden">
                    {apt.customerPhone}
                  </p>

                  {/* Details Row */}
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-0.5 mb-1.5 sm:mb-2 text-[10px] sm:text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Scissors className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                      {apt.serviceName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                      {apt.timeSlot}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                      ₹{apt.totalAmount}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">
                      Pay: {apt.paymentStatus || "pending"}
                    </span>
                  </div>

                  {/* Add-ons */}
                  {apt.addOns?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-1.5 sm:mb-2">
                      <span className="text-[9px] sm:text-[10px] text-slate-400">
                        Add-ons:
                      </span>
                      {apt.addOns.map((addon, i) => (
                        <span
                          key={i}
                          className="text-[9px] sm:text-[10px] bg-slate-100 px-1 sm:px-1.5 py-0 rounded"
                        >
                          {addon.name} ₹{addon.price}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {apt.notes && (
                    <p className="text-[9px] sm:text-[10px] text-slate-400 italic mb-1.5 sm:mb-2 truncate">
                      📝 {apt.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1.5 border-t border-slate-100">
                    {apt.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(apt._id, "in-progress")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-2.5 rounded"
                      >
                        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden sm:inline">Start Service</span>
                        <span className="sm:hidden">Start</span>
                      </Button>
                    )}

                    {apt.status === "in-progress" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(apt._id, "completed")}
                        className="bg-green-600 hover:bg-green-700 text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-2.5 rounded"
                      >
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        <span className="hidden sm:inline">Mark Complete</span>
                        <span className="sm:hidden">Complete</span>
                      </Button>
                    )}

                    {["confirmed", "in-progress"].includes(apt.status) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(apt._id, "cancelled")}
                        className="text-[10px] sm:text-xs h-6 sm:h-7 px-2 sm:px-2.5 rounded"
                      >
                        <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                        Cancel
                      </Button>
                    )}

                    {apt.status === "completed" && (
                      <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                        ✓ Completed
                      </span>
                    )}

                    {apt.status === "cancelled" && (
                      <span className="text-[10px] sm:text-xs text-red-500 font-medium">
                        ✗ Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-slate-500">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs sm:text-sm">
                {isToday
                  ? "No appointments scheduled for today"
                  : "No appointments on this date"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
);



       

}