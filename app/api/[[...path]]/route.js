import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Service from "@/models/Service";
import Barber from "@/models/Barber";
import Customer from "@/models/Customer";
import Appointment from "@/models/Appointment";
import Gallery from "@/models/Gallery";
import Settings from "@/models/Settings";
import mongoose from "mongoose";

// Helpers
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// async function generateCustomId(collection, prefix) {
//   const lastDoc = await collection
//     .findOne({})
//     .sort({ createdAt: -1 })
//     .lean();

//   if (!lastDoc || !lastDoc.customId) {
//     return `${prefix}001`;
//   }

//   const lastNumber = parseInt(lastDoc.customId.replace(prefix, ""));
//   const nextNumber = lastNumber + 1;

//   return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
// }

async function generateCustomId(Model, prefix) {
  const count = await Model.countDocuments();
  let nextNumber = count + 1;

  // Keep incrementing if ID exists
  let customId = `${prefix}${nextNumber.toString().padStart(3, "0")}`;

  while (await Model.findOne({ barberId: customId })) {
    nextNumber++;
    customId = `${prefix}${nextNumber.toString().padStart(3, "0")}`;
  }

  return customId;
}

function hashPassword(password) {
  return Buffer.from(password).toString("base64");
}

// function verifyPassword(password, hash) {
//   return hashPassword(password) === hash;
// }

function verifyPassword(password, hash) {
  return password === hash;
}

function generateTimeSlots(startHour = 9, endHour = 20, interval = 30) {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += interval) {
      // slots.push(
      //   `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      // );
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";

      const time = `${hour12.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")} ${ampm}`;

      slots.push(time);
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
    console.log("Mongo connected");
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
      const showAll = searchParams.get("all"); 
      // const query = activeOnly === "false" ? {} : { isAvailable: true };
      // const query = activeOnly === "false" ? {} : { active: true };
      const query = showAll === "true" ? {} : { active: true };
      const barbers = await Barber.find(query).sort({ createdAt: -1 });
      return res({ success: true, barbers });
    }

    if (path.match(/^barbers\/[\w-]+$/)) {
      const id = path.split("/")[1];
      const barber = await Barber.findOne({ id });
      if (!barber) return res({ error: "Barber not found" }, 404);
      return res({ success: true, barber });
    }

    // -------- Availability --------
    if (path === "availability") {
      const barberId = searchParams.get("barberId");
      // console.log("barberId found:", barberId);
      const date = searchParams.get("date");

      if (!barberId || !date)
        return res({ error: "Missing barberId or date" }, 400);

      
      if (!mongoose.Types.ObjectId.isValid(barberId)) {
        return res({ error: "Invalid barber id" }, 400);
      }
      const _id = new mongoose.Types.ObjectId(barberId);
      // const barber = await Barber.findOne({ _id });
      const barber = await Barber.findById(barberId);
      // const barber = await Barber.findOne({ barberId });
      // console.log("barber found:", barber);
      if (!barber) return res({ error: "Barber not found" }, 404);

      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        barber: _id,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["pending", "confirmed", "in-progress", "completed"] },
      }).lean();

      const bookedSlots = appointments.map((apt) => apt.timeSlot);
      const allSlots = generateTimeSlots(9, 20, 30);
      const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

      return res({ success: true, availableSlots, bookedSlots });
    }

    // -------- Appointments --------
    // if (path === "appointments") {
    //   const query = {};
    //   const barberId = searchParams.get("barberId");
    //   const date = searchParams.get("date");
    //   const customerId = searchParams.get("customerId");
    //   const status = searchParams.get("status");

    //   if (barberId) query.barberId = barberId;
    //   if (date) query.date = date;
    //   if (customerId) query.customerId = customerId;
    //   if (status) query.status = status;

    //   const appointments = await Appointment.find(query)
    //     .sort({ date: -1, timeSlot: -1 })
    //     .lean();

    //   // const appointments = await Appointment.find(query)
    //   // .populate("barber", "name phone specialty")
    //   // .populate("services", "name price duration")
    //   // .populate("customer", "name phone")
    //   // .sort({ date: -1, timeSlot: -1 })
    //   // .lean();

    //   // console.log("appointments",appointments);
        

    //   // Enrich with barber & service names
    //   for (let apt of appointments) {
    //     const barber = await Barber.findOne({ _id: apt.barber }).lean();
    //     const service = await Service.findOne({ _id: apt.services[0] }).lean();
    //     const customer = await Customer.findOne({ _id: apt.customer }).lean();
    //     apt.barberName = barber?.name || "Unknown";
    //     apt.serviceName = service?.name || "Unknown";
    //     apt.customerName = customer?.name || "Unknown";
    //     apt.servicePrice = service?.price || 0;
    //   }

    //   return res({ success: true, appointments });
    // }

    if (path === "appointments") {
      const query = {};
      const barberId = searchParams.get("barberId");
      const date = searchParams.get("date");
      const customerId = searchParams.get("customerId");
      const status = searchParams.get("status");

      if (barberId) query.barber = barberId;
      if (date) query.date = date;
      if (customerId) query.customer = customerId;
      if (status) query.status = status;

      const appointments = await Appointment.find(query)
        .populate("barber", "name phone specialty")
        .populate("customer", "name phone email")
        .populate("services", "name price duration category")
        .sort({ date: -1, timeSlot: -1 })
        .lean();

      // const totalAmount = serviceTotal + addOnsTotal;

      const formattedAppointments = appointments.map((apt, index) => {
        const servicesTotal = (apt.services || []).reduce(
          (sum, service) => sum + (service?.price || 0),
          0
        );

        const addOnsTotal = (apt.addOns || []).reduce(
          (sum, addon) => sum + (Number(addon?.price) || 0),
          0
        );
        // console.log(apt.services);
        return {
          ...apt,
          // serialNumber: dateCounters[aptDate],
          // barberName: apt.barber?.name || "Unknown",
          // customerName: apt.customer?.name || "Unknown",
          // customerPhone: apt.customer?.phone || "Unknown",
          // customerEmail: apt.customer?.email || "",
          // serviceName: apt.services?.map((s) => s.name).join(", ") || "Unknown",
          // serviceName: apt.services?.[0]?.name || "Unknown",//appointments[0].services[0].name
          // servicePrice: servicesTotal,
          // addOnsTotal,
          totalAmount: servicesTotal + addOnsTotal,
        };
      });

      return res({ success: true, appointments: formattedAppointments });
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
      const customer = await Customer.findOne({
        customerId: appointment.customerId,
      })
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

      const appointments = await Appointment.find({ customerId }).sort({ date: -1, });

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
      let settings = await Settings.findOne({ settingsType: "shop" });
      if (!settings) {
        // Drop old indexes first
        await mongoose.connection.db.collection("settings").dropIndexes();
        settings = await Settings.create({
          settingsType: "shop",
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

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayCompletedAppointments = await Appointment.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "completed",
      }).lean();

      // console.log("today completed appointments", todayCompletedAppointments);



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
        // Appointment.countDocuments({ date: today }),
        // Appointment.countDocuments({ date: today, status: "completed" }),
        // Appointment.countDocuments({ date: today, status: { $in: ["pending", "confirmed"] }, }),
        // Appointment.aggregate([
        //   { $match: { status: "completed" } },
        //   { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        // ]),
        // Appointment.aggregate([
        //   { $match: { date: today, status: "completed" } },
        //   { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        // ]),

        Appointment.countDocuments({
          date: { $gte: startOfDay, $lte: endOfDay },
        }),

        Appointment.countDocuments({
          date: { $gte: startOfDay, $lte: endOfDay },
          status: "completed",
        }),

        Appointment.countDocuments({
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["pending", "confirmed"] },
        }),

        Appointment.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),

        Appointment.aggregate([
          {
            $match: {
              date: { $gte: startOfDay, $lte: endOfDay },
              status: "completed",
            },
          },
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

    // -------- Barber Profile --------
    if (path === "barber/profile") {
      const email = searchParams.get("email");
      const id = searchParams.get("id");

      let barber = null;

      if (id && mongoose.Types.ObjectId.isValid(id)) {
        barber = await Barber.findById(id).lean();
      } else if (email) {
        barber = await Barber.findOne({ email }).lean();
      }

      if (!barber) return res({ error: "Barber not found" }, 404);

      return res({ success: true, barber });
    }

    // -------- Barber Stats --------
    if (path === "barber/stats") {
      const barberId = searchParams.get("barberId");

      if (!barberId || !mongoose.Types.ObjectId.isValid(barberId)) {
        return res({ error: "Invalid barber ID" }, 400);
      }

      const barber = await Barber.findById(barberId).lean();
      if (!barber) return res({ error: "Barber not found" }, 404);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [todayAppointments, completedToday, pendingToday] =
        await Promise.all([
          Appointment.countDocuments({
            barber: barberId,
            date: { $gte: startOfDay, $lte: endOfDay },
          }),
          Appointment.countDocuments({
            barber: barberId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: "completed",
          }),
          Appointment.countDocuments({
            barber: barberId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["pending", "confirmed"] },
          }),
        ]);

      return res({
        success: true,
        stats: {
          todayAppointments,
          completedToday,
          pendingToday,
        },
      });
    }

    // -------- Barber Schedule --------
    if (path === "barber/schedule") {
      const barberId = searchParams.get("barberId");
      const date = searchParams.get("date");

      if (!barberId || !mongoose.Types.ObjectId.isValid(barberId)) {
        return res({ error: "Invalid barber ID" }, 400);
      }

      const selectedDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await Appointment.find({
        barber: barberId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .populate("customer", "name phone email")
        .populate("services", "name price duration category")
        .populate("barber", "name specialty")
        .sort({ timeSlot: 1 })
        .lean();

      const formattedAppointments = appointments.map((apt, index) => ({
        ...apt,
        serialNumber: index + 1,
        customerName: apt.customer?.name || "Walk-in",
        customerPhone: apt.customer?.phone || "N/A",
        customerEmail: apt.customer?.email || "",
        serviceName: apt.services?.map((s) => s.name).join(", ") || "N/A",
        servicePrice:
          apt.services?.reduce((sum, s) => sum + (s.price || 0), 0) || 0,
        addOnsTotal: (apt.addOns || []).reduce(
          (sum, a) => sum + (Number(a.price) || 0), 0
        ),
      }));

      return res({ success: true, appointments: formattedAppointments });
    }

    // -------- Barber Earnings --------
    if (path === "barber/earnings") {
      const barberId = searchParams.get("barberId");
      const period = searchParams.get("period") || "month";

      if (!barberId || !mongoose.Types.ObjectId.isValid(barberId)) {
        return res({ error: "Invalid barber ID" }, 400);
      }

      let startDate = new Date();

      if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      startDate.setHours(0, 0, 0, 0);

      const completedAppointments = await Appointment.find({
        barber: barberId,
        status: "completed",
        date: { $gte: startDate },
      })
        .populate("services", "name price")
        .populate("customer", "name phone")
        .sort({ date: -1 })
        .lean();

      // Daily earnings breakdown
      const dailyEarnings = {};
      completedAppointments.forEach((apt) => {
        const dateKey = new Date(apt.date).toISOString().split("T")[0];
        if (!dailyEarnings[dateKey]) {
          dailyEarnings[dateKey] = { date: dateKey, amount: 0, count: 0 };
        }
        dailyEarnings[dateKey].amount += apt.totalAmount || 0;
        dailyEarnings[dateKey].count += 1;
      });

      const totalEarnings = completedAppointments.reduce(
        (sum, apt) => sum + (apt.totalAmount || 0), 0
      );

      return res({
        success: true,
        earnings: {
          total: totalEarnings,
          count: completedAppointments.length,
          daily: Object.values(dailyEarnings).sort((a, b) =>
            b.date.localeCompare(a.date)
          ),
          appointments: completedAppointments,
        },
      });
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

      // console.log("User found:", user);
      // console.log("Stored password:", user?.password);
      // console.log("Input password:", body.password);
      // console.log("Hashed input:", hashPassword(body.password));
      // console.log("Match:", user?.password === hashPassword(body.password));

      if (!user || !verifyPassword(body.password, user.password)) {
        return res({ error: "Invalid credentials" }, 401);
      }

      // Check if user is active
      if (!user.active) {
        return res({ error: "Your account is deactivated. Contact admin." }, 403);
      }

      // If barber, check barber profile is active
      if (user.role === "barber") {
        const barber = await Barber.findOne({ email: body.email });
        if (!barber || !barber.active) {
          return res(
            { error: "Your barber account is deactivated. Contact admin." },
            403
          );
        }
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
      const userId = await generateCustomId(User, "U");

      const user = await User.create({
        userId,
        name: body.name,
        email: body.email,
        // password: hashPassword(body.password),
        password: body.password,
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
      const customId = await generateCustomId(Service, "S");
      const service = await Service.create({
        serviceId: customId,
        ...body,
      });
      return res({ success: true, service, message: "Service created" }, 201);
    }

    // -------- Create Barber --------
    if (path === "barbers") {
      // Check if email already exists
      const existingBarber = await Barber.findOne({ email: body.email });
      if (existingBarber) {
        return res({ error: "Barber with this email already exists" }, 400);
      }

      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return res({ error: "User with this email already exists" }, 400);
      }

      const customId = await generateCustomId(Barber, "B");
      const barber = await Barber.create({
        barberId: customId,
        ...body,
      });

      
      // 2. Auto-create User account for barber login
      await User.create({
        name: body.name,
        email: body.email,
        // password: hashPassword(body.password || "barber123"),
        password: body.password || "barber123",
        phone: body.phone,
        role: "barber",
        barber: barber._id,
        active: true,
      });

      return res({ success: true, barber, message: "Barber created" }, 201);
    }

    // -------- Create Appointment --------
    if (path === "appointments") {
      try {
        // Find barber by _id
        const barber = await Barber.findById(body.barber);
        if (!barber) return res({ error: "Barber not found" }, 404);

        // Check slot availability
        const existing = await Appointment.findOne({
          barber: barber._id,
          date: body.date,
          timeSlot: body.timeSlot,
          status: { $in: ["pending", "confirmed", "in-progress"] },
        });
        if (existing) return res({ error: "Slot already booked" }, 400);

        // Find services by _id
        const serviceIds = body.services || [];
        const serviceDocs = await Service.find({ _id: { $in: serviceIds } });

        // Calculate services total
        const servicesTotal = serviceDocs.reduce(
          (sum, s) => sum + (s.price || 0),
          0
        );

        // Calculate addOns total
        const addOnsTotal = (body.addOns || []).reduce(
          (sum, addon) => sum + (Number(addon?.price) || 0),
          0
        );

        // Total amount
        const totalAmount = servicesTotal + addOnsTotal;
        const appointmentId = await generateCustomId(Appointment, "APT");

        // Find or create customer
        let customer = null;
        if (body.customerPhone) {
          customer = await Customer.findOne({ phone: body.customerPhone });

          if (!customer) {
            customer = await Customer.create({
              name: body.customerName,
              phone: body.customerPhone,
              email: body.customerEmail || "",
            });
          } else {
            await Customer.findByIdAndUpdate(customer._id, {
              $inc: { totalVisits: 1 },
            });
          }
        }

        // Create appointment
        const appointment = await Appointment.create({
          appointmentId,
          customer: customer?._id,
          barber: barber._id,
          services: serviceDocs.map((s) => s._id),
          addOns: body.addOns || [],
          date: body.date,
          timeSlot: body.timeSlot,
          totalAmount,
          status: "confirmed",
          paymentStatus: "pending",
          notes: body.notes || "",
        });

        // Update barber bookings
        await Barber.findByIdAndUpdate(barber._id, {
          $inc: { totalBookings: 1 },
        });

        return res(
          {
            success: true,
            appointment,
            message: "Appointment booked successfully!",
          }, 201
        );
      } catch (error) {
        console.error("Appointment create error:", error);
        return res({ error: error.message }, 500);
      }
    }

    // -------- Create Customer --------
    if (path === "customers") {
      const customerId = await generateCustomId(Customer, "C");
      const existing = await Customer.findOne({ phone: body.phone });
      if (existing)
        return res(
          { error: "Customer with this phone already exists" },
          400
        );

      const customer = await Customer.create({
        customerId,
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
      // const barberId = path.split("/")[1];
      const id = path.split("/")[1];
      // const barber = await Barber.findOneAndUpdate(
      //   barberId,
      //   { $set: body },
      //   { returnDocument: "after", runValidators: true }
      // );
      const barber = await Barber.findByIdAndUpdate(
        id,
        { $set: body },
        { returnDocument: "after", runValidators: true }
      );
      if (!barber) return res({ error: "Barber not found" }, 404);

      // Also update user account
      if (barber.email) {
        const updateUser = {
          name: body.name || barber.name,
          phone: body.phone || barber.phone,
          active: body.active !== undefined ? body.active : barber.active,
        };

        await User.findOneAndUpdate(
          { email: barber.email },
          { $set: updateUser }
        );
      }

      return res({ success: true, barber, message: "Barber updated" });
    }

    // -------- Update Appointment --------
    if (path.startsWith("appointments/")) {
      const id = path.split("/")[1];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res({ error: "Invalid ID" }, 400);
      }

      if (body.status === "completed") {
        body.completedAt = new Date();
        body.paymentStatus = "paid";
      }

      if (body.status === "cancelled") {
        body.paymentStatus = "refunded";
      }

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: body },
        { returnDocument: "after", runValidators: true }
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
      console.log("BODY:", body);

      const cleanBody = {
        shopName: body.shopName,
        phone: body.phone,
        address: body.address,
        openTime: body.openTime,
        closeTime: body.closeTime,
        slotDuration: body.slotDuration,
        closedDays: body.closedDays,
      };
        // { settingsType: "shop" },

      const settings = await Settings.findOneAndUpdate(
        { settingsType: "shop" },
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
      const id = path.split("/")[1];
      const barber = await Barber.findOneAndUpdate(
        id,
        { $set: { active: false } },
        { returnDocument: "after" }
        // { new: true }
      );
      if (!barber) return res({ error: "Barber not found" }, 404);

      // Also deactivate user account
      if (barber.email) {
        await User.findOneAndUpdate(
          { email: barber.email },
          { $set: { active: false } }
        );
      }

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