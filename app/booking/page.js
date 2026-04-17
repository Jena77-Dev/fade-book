'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from 'lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, User, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState("service");
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const steps = [
    { key: "service", label: "Service" },
    { key: "barber", label: "Barber" },
    { key: "datetime", label: "Date & Time" },
    { key: "confirm", label: "Confirm" },
  ];
  const stepIndex = steps.findIndex((s) => s.key === step);

  const addOns = [
    { id: "a1", name: "Oil Massage", price: 50 },
    { id: "a2", name: "Hair Wash", price: 30 },
    { id: "a3", name: "Styling Gel/Wax", price: 40 },
  ];

  const totalAddOns = selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const totalPrice = (selectedService?.price || 0) + totalAddOns;

  useEffect(() => {
    fetchServicesAndBarbers();
    
    // Check if user is logged in and pre-fill info
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setCustomerInfo({
        name: parsedUser.name,
        phone: parsedUser.phone,
        email: parsedUser.email
      });
    }
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedBarber, selectedDate]);

  // const fetchServicesAndBarbers = async () => {
  //   try {
  //     const [servicesRes, barbersRes] = await Promise.all([
  //       fetch('http://localhost:3000/api/services'),
  //       fetch('http://localhost:3000/api/barbers')
  //     ]);
  //     const servicesData = await servicesRes.json();
  //     const barbersData = await barbersRes.json();
  //     setServices(servicesData.services || []);
  //     setBarbers(barbersData.barbers || []);
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };

  const fetchServicesAndBarbers = async () => {
    try {
      const [servicesData, barbersData] = await Promise.all([
        api.get('/services'),
        api.get('/barbers')
      ]);
      setServices(servicesData.services || []);
      setBarbers(barbersData.barbers || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // const res = await fetch(`http://localhost:3000/api/availability?barberId=${selectedBarber._id}&date=${dateStr}`);
      const data = await api.get(`/availability?barberId=${selectedBarber._id}&date=${dateStr}`);
      // const data = await res.json();
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // function isSlotPassed(dateStr, slotTime) {
  //   // dateStr = "2026-03-26"
  //   // slotTime = "09:00 AM"

  //   const today = new Date();
  //   const selectedDate = new Date(`${dateStr}T00:00:00`);

  //   // only disable if selected date is today
  //   if (selectedDate.toDateString() !== today.toDateString()) {
  //     return false;
  //   }

  //   // convert slot to Date
  //   const [time, modifier] = slotTime.split(" ");
  //   let [hours, minutes] = time.split(":").map(Number);

  //   if (modifier === "PM" && hours !== 12) hours += 12;
  //   if (modifier === "AM" && hours === 12) hours = 0;

  //   const slotDateTime = new Date(selectedDate);
  //   slotDateTime.setHours(hours, minutes, 0, 0);

  //   return slotDateTime < today;
  // }

  function isSlotPast(slotTime) {
    const now = new Date();
    const selectedDt = new Date(selectedDate);

    const [timePart, ampm] = slotTime.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);

    let slotHour = hours;
    if (ampm === "PM" && slotHour !== 12) {
      slotHour += 12;
    } else if (ampm === "AM" && slotHour === 12) {
      slotHour = 0;
    }

    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(slotHour, minutes, 0, 0);

    return now > slotDateTime;
  }

  const handleBooking = async () => {
    setLoading(true);
    try {
      const selectedAddOnObjects = addOns.filter(a => selectedAddOns.includes(a.id) );
      const appointment = {
        barber: selectedBarber._id,
        services: [selectedService._id],
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        totalAmount: selectedService.price,
        addOns: selectedAddOnObjects,
        notes: ''
      };

      // const res = await fetch('http://localhost:3000/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointment)
      // });

      const data = await api.post('/appointments', appointment);
      // const data = await res.json();
      
      // if (res.ok) {
      // Check for success property since interceptor returns response.data
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/'), 3000);
      } else {
        alert(data.error || data.message || 'Booking failed');
      }
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.message || 'Booking failed');
      } finally {
        setLoading(false);
      }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your appointment has been booked successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p><strong>Service:</strong> {selectedService?.name}</p>
              <p><strong>Barber:</strong> {selectedBarber?.name}</p>
              <p><strong>Date:</strong> {format(selectedDate, 'PPP')}</p>
              <p><strong>Time:</strong> {selectedSlot}</p>
              <p><strong>Amount:</strong> ₹{selectedService?.price}</p>
            </div>
            <p className="text-sm text-slate-600 text-center">
              A confirmation has been sent to your WhatsApp & SMS
            </p>
            {!user && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-center">
                <p className="text-blue-900 mb-2">
                  📝 Want to track your bookings?
                </p>
                <Button onClick={() => router.push('/login')} size="sm" variant="outline">
                  Create Account / Login
                </Button>
              </div>
            )}
            <Button onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
            {user && (
              <Button onClick={() => router.push('/my-bookings')} variant="outline" className="w-full">
                View My Bookings
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          {/* Title — Responsive */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Book Your Appointment
            </h1>
          </div>

          {/* Stepper */}
          <div className="flex items-start justify-center mb-8 md:mb-10">
            <div className="flex items-start gap-0">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-start">
                  {/* Step */}
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                        i <= stepIndex
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </div>

                    {/* Label — Always visible */}
                    <span
                      className={`mt-1.5 text-[9px] sm:text-[10px] md:text-xs font-medium text-center w-14 sm:w-16 md:w-20 leading-tight ${
                        i <= stepIndex ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {i < steps.length - 1 && (
                    <div
                      className={`mt-4 sm:mt-[18px] md:mt-5 h-[2px] w-8 sm:w-12 md:w-16 lg:w-20 ${
                        i < stepIndex ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === "service" && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
              <CardDescription>Choose the service you want</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <div
                    key={service.serviceId}
                    onClick={() => {
                      setSelectedService(service);
                      // setStep(2);
                      // setStep("barber")
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedService?.serviceId === service.serviceId
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <Badge className="bg-green-100 text-green-700">₹{service.price}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      {service.duration} min
                    </div>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              {selectedService && (
                <div className="mt-6">
                  <h3 className="font-display font-semibold mb-3 ml-1">Add-ons (Optional)</h3>
                  {addOns.map((addon) => (
                    <label key={addon.id} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer">
                      <Checkbox
                        checked={selectedAddOns.includes(addon.id)}
                        onCheckedChange={(checked) =>
                          setSelectedAddOns(checked
                            ? [...selectedAddOns, addon.id]
                            : selectedAddOns.filter((id) => id !== addon.id)
                          )
                        }
                        className="h-5 w-5 rounded-full border-2 border-slate-400 data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white"
                      />
                      <span className="flex-1 text-sm">{addon.name}</span>
                      <span className="text-sm  font-medium">+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
              )}

            {/* Actions */}
            <div className="flex justify-end mt-6">
              <Button
                disabled={!selectedService}
                onClick={() => setStep("barber")}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Barber */}
        {step === "barber" && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Barber</CardTitle>
              <CardDescription>Choose your preferred barber</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbers.map(barber => (
                  <div
                    key={barber.barberId}
                    onClick={() => {
                      setSelectedBarber(barber);
                      // setStep(3);
                      setStep("datetime")
                    }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedBarber?.barberId === barber.barberId
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{barber.name}</h3>
                        <p className="text-sm text-slate-600">{barber.specialty}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">{barber.experience} years experience</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep("service")} variant="outline" className="mt-4">
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date & Time */}
        {step === "datetime" && (
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>Choose your preferred date and time slot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  {/* <Label className="mb-2 block">Select Date</Label> */}
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    // disabled={(date) => date < new Date() || date.getDay() === 1}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      return date < today || date.getDay() === 1;
                    }}
                    className="rounded-md border"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label className="mb-2 block">Available Time Slots</Label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map(slot => {
                          const slotTime = slot; // "09:00 AM"
                          const isPastSlot = isSlotPast(slotTime);
                          return (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? 'default' : 'outline'}
                              // onClick={() => setSelectedSlot(slot)}
                              onClick={() => !isPastSlot && setSelectedSlot(slot)}
                              disabled={isPastSlot}
                              className="w-full"
                            >
                              {slot}
                            </Button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-600">
                        <AlertCircle className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                        <p>No slots available for this date</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block text-lg font-semibold">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 1}
                    className="rounded-md border w-full"
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-lg font-semibold">Available Time Slots</Label>
                  {!selectedDate ? (
                    <div className="text-center py-12 text-slate-500 border rounded-md">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                      <p>Please select a date first</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-600 border rounded-md">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                      <p>No slots available for this date</p>
                    </div>
                  )}
                </div>
              </div> */}

              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={() => setStep("barber")} 
                  variant="outline">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep("confirm")} 
                  disabled={!selectedDate || !selectedSlot}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Customer Info & Confirm */}
        {step === "confirm" && (
          // <Card>
          //   <CardHeader>
          //     <CardTitle>Your Information</CardTitle>
          //     <CardDescription>Please provide your contact details</CardDescription>
          //   </CardHeader>
          //   <CardContent>
          //     <div className="space-y-4">
          //       <div>
          //         <Label>Full Name *</Label>
          //         <Input
          //           value={customerInfo.name}
          //           onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
          //           placeholder="Enter your name"
          //         />
          //       </div>
          //       <div>
          //         <Label>Phone Number *</Label>
          //         <Input
          //           value={customerInfo.phone}
          //           onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
          //           placeholder="+91 XXXXX XXXXX"
          //         />
          //       </div>
          //       <div>
          //         <Label>Email (Optional)</Label>
          //         <Input
          //           type="email"
          //           value={customerInfo.email}
          //           onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
          //           placeholder="your@email.com"
          //         />
          //       </div>

          //       <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          //         <h3 className="font-semibold mb-3">Booking Summary</h3>
          //         <p className="text-sm"><strong>Service:</strong> {selectedService?.name}</p>
          //         <p className="text-sm"><strong>Barber:</strong> {selectedBarber?.name}</p>
          //         <p className="text-sm"><strong>Date:</strong> {format(selectedDate, 'PPP')}</p>
          //         <p className="text-sm"><strong>Time:</strong> {selectedSlot}</p>
          //         <p className="text-sm"><strong>Duration:</strong> {selectedService?.duration} min</p>
          //         <div className="border-t pt-2 mt-2">
          //           <p className="text-lg font-bold">Total: ₹{selectedService?.price}</p>
          //         </div>
          //       </div>

          //       <div className="bg-blue-50 p-3 rounded-lg text-sm">
          //         <p className="text-blue-900">
          //           💳 Payment can be made at the shop. You can also pay advance (20%) via Razorpay to confirm.
          //         </p>
          //       </div>
          //     </div>

          //     <div className="flex gap-2 mt-6">
          //       <Button onClick={() => setStep(3)} variant="outline">
          //         Back
          //       </Button>
          //       <Button 
          //         onClick={handleBooking}
          //         disabled={!customerInfo.name || !customerInfo.phone || loading}
          //         className="flex-1"
          //       >
          //         {loading ? 'Booking...' : 'Confirm Booking'}
          //       </Button>
          //     </div>
          //   </CardContent>
          // </Card>

          <Card className="bg-card">
            
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your contact details</CardDescription>
            </CardHeader>

            {/* <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-8 py-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-accent outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g., 9876543210)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div> */}
            <CardContent className="p-6 space-y-3">
                <div>
                   <Label>Full Name *</Label>
                   <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

              <h3 className="font-display text-lg font-bold mb-4">Booking Summary</h3>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Barber</span><span className="font-medium">{selectedBarber?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium">{selectedDate?.toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="font-medium">{selectedSlot}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-medium">{selectedService?.duration} min</span></div>
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">{selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).join(", ")}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                {/* <span className="font-bold flex items-center gap-0.5"><IndianRupee className="h-4 w-4" />{selectedService?.price}</span> */}
                <span className="font-bold flex items-center gap-0.5"><IndianRupee className="h-4 w-4" />{totalPrice}</span>

              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setStep("datetime")} variant="outline">
                  Back
                </Button>
                <Button 
                  onClick={handleBooking}
                  disabled={!customerInfo.name || !customerInfo.phone || loading}
                  className="flex-1"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>

        )}
      </div>
    </div>
  );
}

