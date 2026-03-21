import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Service from "@/models/Service";
import Barber from "@/models/Barber";
import Customer from "@/models/Customer";
import Appointment from "@/models/Appointment";
import Gallery from "@/models/Gallery";
import Settings from "@/models/Settings";

// Helpers
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function hashPassword(password) {
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateTimeSlots(startHour = 9, endHour = 20, interval = 30) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      slots.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    }
  }
  return slots;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function res(data, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return res({});
}

// ======================== GET ========================
export async function GET(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const path = params.path ? params.path.join("/") : "";
    const { searchParams } = new URL(request.url);

    // -------- Auth Session --------
    if (path === "auth/session") {
      const userId = request.headers.get("x-user-id");
      if (!userId) return res({ user: null });

      const user = await User.findOne({ userId }).select("-password");
      return res({ user: user || null });
    }

    // -------- Services --------
    if (path === "services") {
      const category = searchParams.get("category");
      const query = category ? { category } : {};
      const services = await Service.find(query).sort({ createdAt: -1 });
      return res({ success: true, services });
    }

    if (path.match(/^services\/[\w-]+$/)) {
      const serviceId = path.split("/")[1];
      const service = await Service.findOne({ serviceId });
      if (!service) return res({ error: "Service not found" }, 404);
      return res({ success: true, service });
    }

    // -------- Barbers --------
    if (path === "barbers") {
      const activeOnly = searchParams.get("active");
      const query = activeOnly === "false" ? {} : { active: true };
      const barbers = await Barber.find(query).sort({ createdAt: -1 });
      return res({ success: true, barbers });
    }

    if (path.match(/^barbers\/[\w-]+$/)) {
      const barberId = path.split("/")[1];
      const barber = await Barber.findOne({ barberId });
      if (!barber) return res({ error: "Barber not found" }, 404);
      return res({ success: true, barber });
    }

    // -------- Availability --------
    if (path === "availability") {
      const barberId = searchParams.get("barberId");
      const date = searchParams.get("date");

      if (!barberId || !date)
        return res({ error: "Missing barberId or date" }, 400);

      const barber = await Barber.findOne({ barberId });
      if (!barber) return res({ error: "Barber not found" }, 404);

      const appointments = await Appointment.find({
        barberId,
        date,
        status: { $in: ["pending", "confirmed", "in-progress"] },
      });

      const bookedSlots = appointments.map((apt) => apt.timeSlot);
      const allSlots = generateTimeSlots(9, 20, 30);
      const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

      return res({ success: true, availableSlots, bookedSlots });
    }

    // -------- Appointments --------
    if (path === "appointments") {
      const query = {};
      const barberId = searchParams.get("barberId");
      const date = searchParams.get("date");
      const customerId = searchParams.get("customerId");
      const status = searchParams.get("status");

      if (barberId) query.barberId = barberId;
      if (date) query.date = date;
      if (customerId) query.customerId = customerId;
      if (status) query.status = status;

      const appointments = await Appointment.find(query)
        .sort({ date: -1, timeSlot: -1 })
        .lean();

      // Enrich with barber & service names
      for (let apt of appointments) {
        const barber = await Barber.findOne({ barberId: apt.barberId }).lean();
        const service = await Service.findOne({
          serviceId: apt.serviceId,
        }).lean();
        apt.barberName = barber?.name || "Unknown";
        apt.serviceName = service?.name || "Unknown";
        apt.servicePrice = service?.price || 0;
      }

      return res({ success: true, appointments });
    }

    if (path.match(/^appointments\/[\w-]+$/)) {
      const appointmentId = path.split("/")[1];
      const appointment = await Appointment.findOne({ appointmentId }).lean();
      if (!appointment)
        return res({ error: "Appointment not found" }, 404);

      const barber = await Barber.findOne({
        barberId: appointment.barberId,
      }).lean();
      const service = await Service.findOne({
        serviceId: appointment.serviceId,
      }).lean();
      appointment.barberName = barber?.name || "Unknown";
      appointment.serviceName = service?.name || "Unknown";

      return res({ success: true, appointment });
    }

    // -------- Customers --------
    if (path === "customers") {
      const customers = await Customer.find().sort({ createdAt: -1 });
      return res({ success: true, customers });
    }

    if (path.match(/^customers\/[\w-]+$/)) {
      const customerId = path.split("/")[1];
      const customer = await Customer.findOne({ customerId });
      if (!customer) return res({ error: "Customer not found" }, 404);

      const appointments = await Appointment.find({ customerId }).sort({
        date: -1,
      });
      return res({ success: true, customer, appointments });
    }

    // -------- Gallery --------
    if (path === "gallery") {
      const category = searchParams.get("category");
      const query = category ? { category } : {};
      const images = await Gallery.find(query).sort({ createdAt: -1 });
      return res({ success: true, images });
    }

    // -------- Settings --------
    if (path === "settings") {
      let settings = await Settings.findOne({ type: "shop" });
      if (!settings) {
        settings = await Settings.create({
          type: "shop",
          shopName: "FadeBook Barbershop",
          address: "Shop 12, MG Road, Bangalore, Karnataka 560001",
          phone: "+91 98765 43210",
          whatsapp: "+91 98765 43210",
          email: "info@fadebook.com",
          googleMapsLink: "https://maps.google.com",
        });
      }
      return res({ success: true, settings });
    }

    // -------- Dashboard Stats --------
    if (path === "dashboard/stats") {
      const today = new Date().toISOString().split("T")[0];

      const [
        todayAppointments,
        completedToday,
        pendingToday,
        totalRevenue,
        todayRevenue,
        totalBarbers,
        totalCustomers,
        totalServices,
      ] = await Promise.all([
        Appointment.countDocuments({ date: today }),
        Appointment.countDocuments({ date: today, status: "completed" }),
        Appointment.countDocuments({ date: today, status: { $in: ["pending", "confirmed"] }, }),
        Appointment.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Appointment.aggregate([
          { $match: { date: today, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Barber.countDocuments({ active: true }),
        Customer.countDocuments(),
        Service.countDocuments(),
      ]);

      return res({
        success: true,
        stats: {
          todayAppointments,
          completedToday,
          pendingToday,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayRevenue: todayRevenue[0]?.total || 0,
          totalBarbers,
          totalCustomers,
          totalServices,
        },
      });
    }

    // -------- Dashboard Recent --------
    if (path === "dashboard/recent") {
      const limit = parseInt(searchParams.get("limit")) || 10;
      const appointments = await Appointment.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      for (let apt of appointments) {
        const barber = await Barber.findOne({ barberId: apt.barberId }).lean();
        const service = await Service.findOne({
          serviceId: apt.serviceId,
        }).lean();
        apt.barberName = barber?.name || "Unknown";
        apt.serviceName = service?.name || "Unknown";
      }

      return res({ success: true, appointments });
    }

    return res({ error: "Not found" }, 404);
  } catch (error) {
    console.error("GET Error:", error);
    return res({ error: error.message }, 500);
  }
}

// ======================== POST ========================
export async function POST(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const path = params.path ? params.path.join("/") : "";
    const body = await request.json();

    // -------- Auth Login --------
    if (path === "auth/login") {
      const user = await User.findOne({ email: body.email });
      if (!user || !verifyPassword(body.password, user.password)) {
        return res({ error: "Invalid credentials" }, 401);
      }

      return res({
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
        message: "Login successful",
      });
    }

    // -------- Auth Register --------
    if (path === "auth/register") {
      const existing = await User.findOne({ email: body.email });
      if (existing) return res({ error: "User already exists" }, 400);

      const user = await User.create({
        userId: generateId("user"),
        name: body.name,
        email: body.email,
        password: hashPassword(body.password),
        phone: body.phone,
        role: body.role || "customer",
      });

      return res({
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        },
        message: "Registration successful",
      });
    }

    // -------- Create Service --------
    if (path === "services") {
      const service = await Service.create({
        serviceId: generateId("service"),
        ...body,
      });
      return res({ success: true, service, message: "Service created" }, 201);
    }

    // -------- Create Barber --------
    if (path === "barbers") {
      const barber = await Barber.create({
        barberId: generateId("barber"),
        ...body,
      });
      return res({ success: true, barber, message: "Barber created" }, 201);
    }

    // -------- Create Appointment --------
    if (path === "appointments") {
      // Check slot
      const existing = await Appointment.findOne({
        barberId: body.barberId,
        date: body.date,
        timeSlot: body.timeSlot,
        status: { $in: ["pending", "confirmed", "in-progress"] },
      });
      if (existing) return res({ error: "Slot already booked" }, 400);

      // Get service price
      let totalAmount = body.totalAmount || 0;
      if (body.serviceId && !totalAmount) {
        const service = await Service.findOne({ serviceId: body.serviceId });
        totalAmount = service?.price || 0;
      }

      // Find or create customer
      let customerId = body.customerId;
      if (!customerId && body.customerPhone) {
        let customer = await Customer.findOne({ phone: body.customerPhone });
        if (!customer) {
          customer = await Customer.create({
            customerId: generateId("cust"),
            name: body.customerName,
            phone: body.customerPhone,
            email: body.customerEmail || "",
          });
        } else {
          await Customer.findOneAndUpdate(
            { customerId: customer.customerId },
            { $inc: { totalVisits: 1 } }
          );
        }
        customerId = customer.customerId;
      }

      const appointment = await Appointment.create({
        appointmentId: generateId("apt"),
        ...body,
        customerId,
        totalAmount,
        status: "confirmed",
        paymentStatus: "pending",
      });

      // Update barber bookings
      await Barber.findOneAndUpdate(
        { barberId: body.barberId },
        { $inc: { totalBookings: 1 } }
      );

      return res(
        {
          success: true,
          appointment,
          message: "Appointment booked successfully!",
        },
        201
      );
    }

    // -------- Create Customer --------
    if (path === "customers") {
      const existing = await Customer.findOne({ phone: body.phone });
      if (existing)
        return res(
          { error: "Customer with this phone already exists" },
          400
        );

      const customer = await Customer.create({
        customerId: generateId("cust"),
        ...body,
      });
      return res(
        { success: true, customer, message: "Customer created" },
        201
      );
    }

    // -------- Upload Gallery --------
    if (path === "gallery") {
      const image = await Gallery.create({
        imageId: generateId("img"),
        ...body,
      });
      return res({ success: true, image, message: "Image uploaded" }, 201);
    }

    return res({ error: "Not found" }, 404);
  } catch (error) {
    console.error("POST Error:", error);
    return res({ error: error.message }, 500);
  }
}

// ======================== PUT ========================
export async function PUT(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const path = params.path ? params.path.join("/") : "";
    const body = await request.json();

    // -------- Update Service --------
    if (path.startsWith("services/")) {
      const serviceId = path.split("/")[1];
      const service = await Service.findOneAndUpdate(
        { serviceId },
        { $set: body },
        { new: true, runValidators: true }
      );
      if (!service) return res({ error: "Service not found" }, 404);
      return res({ success: true, service, message: "Service updated" });
    }

    // -------- Update Barber --------
    if (path.startsWith("barbers/")) {
      const barberId = path.split("/")[1];
      const barber = await Barber.findOneAndUpdate(
        { barberId },
        { $set: body },
        { new: true, runValidators: true }
      );
      if (!barber) return res({ error: "Barber not found" }, 404);
      return res({ success: true, barber, message: "Barber updated" });
    }

    // -------- Update Appointment --------
    if (path.startsWith("appointments/")) {
      const appointmentId = path.split("/")[1];
      if (body.status === "completed") {
        body.completedAt = new Date();
      }
      const appointment = await Appointment.findOneAndUpdate(
        { appointmentId },
        { $set: body },
        { new: true, runValidators: true }
      );
      if (!appointment)
        return res({ error: "Appointment not found" }, 404);
      return res({
        success: true,
        appointment,
        message: "Appointment updated",
      });
    }

    // -------- Update Customer --------
    if (path.startsWith("customers/")) {
      const customerId = path.split("/")[1];
      const customer = await Customer.findOneAndUpdate(
        { customerId },
        { $set: body },
        { new: true, runValidators: true }
      );
      if (!customer) return res({ error: "Customer not found" }, 404);
      return res({ success: true, customer, message: "Customer updated" });
    }

    // -------- Update Settings --------
    if (path === "settings") {
      const settings = await Settings.findOneAndUpdate(
        { type: "shop" },
        { $set: body },
        { new: true, upsert: true, runValidators: true }
      );
      return res({ success: true, settings, message: "Settings updated" });
    }

    // -------- Update User --------
    if (path.startsWith("users/")) {
      const userId = path.split("/")[1];
      if (body.password) body.password = hashPassword(body.password);
      const user = await User.findOneAndUpdate(
        { userId },
        { $set: body },
        { new: true }
      ).select("-password");
      if (!user) return res({ error: "User not found" }, 404);
      return res({ success: true, user, message: "User updated" });
    }

    return res({ error: "Not found" }, 404);
  } catch (error) {
    console.error("PUT Error:", error);
    return res({ error: error.message }, 500);
  }
}

// ======================== DELETE ========================
export async function DELETE(request, context) {
  try {
    await connectDB();
    const params = await context.params;
    const path = params.path ? params.path.join("/") : "";

    // -------- Delete Service --------
    if (path.startsWith("services/")) {
      const serviceId = path.split("/")[1];
      const service = await Service.findOneAndDelete({ serviceId });
      if (!service) return res({ error: "Service not found" }, 404);
      return res({ success: true, message: "Service deleted" });
    }

    // -------- Delete Barber (Soft) --------
    if (path.startsWith("barbers/")) {
      const barberId = path.split("/")[1];
      const barber = await Barber.findOneAndUpdate(
        { barberId },
        { $set: { active: false } },
        { new: true }
      );
      if (!barber) return res({ error: "Barber not found" }, 404);
      return res({ success: true, message: "Barber deactivated" });
    }

    // -------- Delete Appointment --------
    if (path.startsWith("appointments/")) {
      const appointmentId = path.split("/")[1];
      const appointment = await Appointment.findOneAndDelete({ appointmentId });
      if (!appointment)
        return res({ error: "Appointment not found" }, 404);
      return res({ success: true, message: "Appointment deleted" });
    }

    // -------- Delete Customer --------
    if (path.startsWith("customers/")) {
      const customerId = path.split("/")[1];
      const customer = await Customer.findOneAndDelete({ customerId });
      if (!customer) return res({ error: "Customer not found" }, 404);
      return res({ success: true, message: "Customer deleted" });
    }

    // -------- Delete Gallery --------
    if (path.startsWith("gallery/")) {
      const imageId = path.split("/")[1];
      const image = await Gallery.findOneAndDelete({ imageId });
      if (!image) return res({ error: "Image not found" }, 404);
      return res({ success: true, message: "Image deleted" });
    }

    return res({ error: "Not found" }, 404);
  } catch (error) {
    console.error("DELETE Error:", error);
    return res({ error: error.message }, 500);
  }
}