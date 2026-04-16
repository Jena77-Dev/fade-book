'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch"
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Calendar, 
  Settings, 
  Plus,
  Edit,
  Trash,
  TrendingUp,
  Clock,
  IndianRupee,
  LogOut
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showBarberDialog, setShowBarberDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editingBarber, setEditingBarber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      alert('Access denied. Admin only.');
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'dashboard') {
        // const res = await fetch('http://localhost:3000/api/dashboard/stats');
        const data = await api.get('/dashboard/stats');
        // const data = await res.json(); 
        setStats(data.stats || {});
      }
      
      if (activeTab === 'services') {
        const data = await api.get('/services');
        setServices(data.services || []);
      }
      
      if (activeTab === 'barbers') {
        const data = await api.get('/barbers?all=true');
        setBarbers(data.barbers || []);
      }
      
      if (activeTab === 'appointments') {
        const data = await api.get('/appointments');
        setAppointments(data.appointments || []);
      }
      
      if (activeTab === 'customers') {
        const data = await api.get('/customers');
        setCustomers(data.customers || []);
      }
      
      if (activeTab === 'settings') {
        const data = await api.get('/settings');
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Barber button handler
  const handleAddBarber = () => {
    setEditingBarber(null);  // Clear editing first
    setShowBarberDialog(true); 
  };

  // Edit Barber button handler
  const handleEditBarber = (barber) => {
    setEditingBarber(barber);
    setShowBarberDialog(true); 
  };

  // const handleSaveService = async (serviceData) => {
  //   try {
  //     const method = editingService ? 'PUT' : 'POST';
  //     const url = editingService ? `http://localhost:3000/api/services/${editingService._id}` : 'http://localhost:3000/api/services';
      
  //     await fetch(url, {
  //       method,
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(serviceData)  //     });
      
  //     setShowServiceDialog(false);
  //     setEditingService(null);
  //     fetchData();
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // };


  const handleSaveService = async (serviceData) => {
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, serviceData);
      } else {
        await api.post("/services", serviceData);
      }

      setShowServiceDialog(false);
      setEditingService(null);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSaveBarber = async (barberData) => {
    try {

      if(editingBarber){
        await api.put(`/barbers/${editingBarber._id}`, barberData);
      }else{
        await api.post(`/barbers`, barberData)
      }
      
      setShowBarberDialog(false);
      setEditingBarber(null);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        // await fetch(`http://localhost:3000/api/services/${serviceId}`, { method: 'DELETE' });
        await api.delete(`/services/${serviceId}`);

        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDeleteBarber = async (barberId) => {
    if (confirm('Are you sure you want to deactivate this barber?')) {
      try {
        // await fetch(`http://localhost:3000/api/barbers/${barberId}`, { method: 'DELETE' });
        await api.delete(`/barbers/${barberId}`);
        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      // await fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });

      await api.put(`/appointments/${appointmentId}`, {
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ==================== Loading/Error States ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Scissors className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================== Header ==================== */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left — Logo */}
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-[10px] md:text-sm text-slate-600 hidden sm:block">
                  FadeBook Management
                </p>
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
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
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* <TabsList className="mb-8">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="barbers">
              <Users className="h-4 w-4 mr-2" />
              Barbers
            </TabsTrigger>
            <TabsTrigger value="services">
              <Scissors className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="h-4 w-4 mr-2" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList> */}

          {/* Tab Navigation */}
          <div className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-6 h-auto bg-slate-100 p-1 rounded-lg">
              <TabsTrigger
                value="dashboard"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Dashboard</span>
              </TabsTrigger>

              <TabsTrigger
                value="appointments"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Calendar className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Appointments</span>
              </TabsTrigger>

              <TabsTrigger
                value="barbers"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Users className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Barbers</span>
              </TabsTrigger>

              <TabsTrigger
                value="services"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Scissors className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Services</span>
              </TabsTrigger>

              <TabsTrigger
                value="customers"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Users className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Customers</span>
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline text-sm">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Names — Only on mobile */}
            <div className="grid grid-cols-6 mt-1 md:hidden">
              <p className={`text-center text-[9px] font-medium ${activeTab === "dashboard" ? "text-blue-600" : "text-slate-400"}`}>
                Dashboard
              </p>
              <p className={`text-center text-[9px] font-medium ${activeTab === "appointments" ? "text-blue-600" : "text-slate-400"}`}>
                Appoints
              </p>
              <p className={`text-center text-[9px] font-medium ${activeTab === "barbers" ? "text-blue-600" : "text-slate-400"}`}>
                Barbers
              </p>
              <p className={`text-center text-[9px] font-medium ${activeTab === "services" ? "text-blue-600" : "text-slate-400"}`}>
                Services
              </p>
              <p className={`text-center text-[9px] font-medium ${activeTab === "customers" ? "text-blue-600" : "text-slate-400"}`}>
                Customers
              </p>
              <p className={`text-center text-[9px] font-medium ${activeTab === "settings" ? "text-blue-600" : "text-slate-400"}`}>
                Settings
              </p>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.todayAppointments || 0}</div>
                  <p className="text-sm text-slate-600 mt-1">
                    {stats.completedToday || 0} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Today's Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold flex items-center">
                    <IndianRupee className="h-6 w-6" />
                    {stats.todayRevenue || 0}
                  </div>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Revenue today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Working Barbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalBarbers || 0}</div>
                  <p className="text-sm text-slate-600 mt-1">Active barbers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalCustomers || 0}</div>
                  <p className="text-sm text-slate-600 mt-1">Registered clients</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={() => setActiveTab('appointments')} className="h-24 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>View Appointments</span>
                </Button>
                <Button onClick={() => { setActiveTab('services'); setShowServiceDialog(true); }} className="h-24 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Add Service</span>
                </Button>
                <Button 
                  onClick={() => { 
                    setActiveTab('barbers'); 
                    // setShowBarberDialog(true); 
                    handleAddBarber()
                  
                  }} 
                  className="h-24 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  <span>Add Barber</span>
                </Button>
                <Button onClick={() => router.push('/booking')} className="h-24 flex flex-col gap-2">
                  <Clock className="h-6 w-6" />
                  <span>Walk-in Booking</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>Manage booking appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length > 0 ? appointments.map(apt => (
                    <div key={apt._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{apt.customer?.name}</h3>
                          <p className="text-sm text-slate-600">{apt.customer?.phone}</p>
                        </div>
                        <Badge className={
                          apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <p><strong>Service:</strong> {apt.services?.map((service) => service.name ? `${service.name} ₹${service.price || 0} ` : "N/A" ).join(", ") || "N/A"}</p>
                        <p><strong>Barber:</strong> {apt.barber?.name}</p>
                        <p><strong>Add-ons: </strong>{apt.addOns.map((addon, index) => (
                            <span
                              key={index}
                              className="text-xs bg-slate-100 mr-2 text-slate-700 px-2 py-1 rounded-md"
                            >
                              {addon.name ? `${addon.name} ₹${addon.price || 0}` : "N/A"}
                            </span>
                          ))}
                        </p>
                         <p><strong>Date:</strong>{" "}
                          {apt.date
                            ? new Date(apt.date).toLocaleDateString("en-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </p>
                        <p><strong>Time:</strong> {apt.timeSlot}</p>
                        <p><strong>Payment:</strong> {apt.paymentStatus || "pending"}</p>
                        <p><strong>Amount:</strong> ₹{apt.totalAmount}</p>
                        
                    </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(apt._id, 'completed')}>
                          Complete
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-slate-600 py-8">No appointments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Manage your services</CardDescription>
                  </div>
                  <ServiceDialog 
                    open={showServiceDialog}
                    onOpenChange={setShowServiceDialog}
                    onSave={handleSaveService}
                    editing={editingService}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <div key={service.serviceId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-slate-600">{service.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">₹{service.price}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span>⏱️ {service.duration} min</span>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingService(service);
                          setShowServiceDialog(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.serviceId)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Barbers Tab */}
          <TabsContent value="barbers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Barbers</CardTitle>
                    <CardDescription>Manage your team</CardDescription>
                  </div>
                  <BarberDialog 
                    open={showBarberDialog}
                    onOpenChange={setShowBarberDialog}
                    onSave={handleSaveBarber}
                    editing={editingBarber}
                    onAdd={handleAddBarber}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbers.map(barber => (
                    <div key={barber.barberId} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{barber.name}</h3>
                          <p className="text-sm text-slate-600">{barber.specialty}</p>
                          <p className="text-xs text-slate-500">{barber.experience} years exp</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" 
                        onClick={() => {
                          // setEditingBarber(barber);
                          // setShowBarberDialog(true);
                          handleEditBarber(barber);
                        }}
                        
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBarber(barber.barberId)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>View all customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.length > 0 ? customers.map(customer => (
                    <div key={customer.customerId} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        <p className="text-sm text-slate-600">{customer.phone}</p>
                        <p className="text-xs text-slate-500">Visits: {customer.totalVisits || 0} | Points: {customer.loyaltyPoints || 0}</p>
                      </div>
                      <Badge>{customer.email || 'No email'}</Badge>
                    </div>
                  )) : (
                    <p className="text-center text-slate-600 py-8">No customers yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>Configure your shop details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Row 1: Shop Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Shop Name</Label>
                      <Input
                        value={settings?.shopName || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, shopName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={settings?.phone || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 2: Address & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={settings?.address || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, address: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={settings?.email || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 3: Open Time, Close Time & Slot Duration */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Open Time</Label>
                      <Input
                        type="time"
                        value={settings?.openTime || "09:00"}
                        onChange={(e) =>
                          setSettings({ ...settings, openTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Close Time</Label>
                      <Input
                        type="time"
                        value={settings?.closeTime || "21:00"}
                        onChange={(e) =>
                          setSettings({ ...settings, closeTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Slot (min)</Label>
                      <Input
                        type="number"
                        min="10"
                        max="120"
                        value={settings?.slotDuration || 30}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            slotDuration: parseInt(e.target.value) || 30,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 4: Closed Days */}
                  <div>
                    <Label className="mb-2 block">Closed Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ].map((day) => {
                        const isSelected = (settings?.closedDays || []).includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const current = settings?.closedDays || [];
                              const updated = isSelected
                                ? current.filter((d) => d !== day)
                                : [...current, day];
                              setSettings({ ...settings, closedDays: updated });
                            }}
                            className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm font-medium transition-all ${
                              isSelected
                                ? "bg-red-100 border-red-300 text-red-700"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✕ " : ""}
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/settings", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            shopName: settings?.shopName,
                            phone: settings?.phone,
                            address: settings?.address,
                            email: settings?.email,
                            openTime: settings?.openTime,
                            closeTime: settings?.closeTime,
                            slotDuration: settings?.slotDuration,
                            closedDays: settings?.closedDays || [],
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert("Settings saved!");
                        } else {
                          alert("Failed to save settings");
                        }
                      } catch (error) {
                        alert("Error saving settings");
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Service Dialog Component
function ServiceDialog({ open, onOpenChange, onSave, editing }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'haircut'
  });

  useEffect(() => {
    if (editing) {
      setFormData(editing);
    } else {
      setFormData({ name: '', description: '', price: '', duration: '', category: 'haircut' });
    }
  }, [editing, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>Enter service details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Service Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
          </div>
          <Button onClick={() => onSave(formData)} className="w-full">
            {editing ? 'Update' : 'Create'} Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Barber Dialog Component
// function BarberDialog({ open, onOpenChange, onSave, editing }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     specialty: '',
//     experience: '',
//     phone: ''
//   });

//   useEffect(() => {
//     if (editing) {
//       setFormData(editing);
//     } else {
//       setFormData({ name: '', specialty: '', experience: '', phone: '' });
//     }
//   }, [editing, open]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogTrigger asChild>
//         <Button>
//           <Plus className="h-4 w-4 mr-2" />
//           Add Barber
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{editing ? 'Edit Barber' : 'Add New Barber'}</DialogTitle>
//           <DialogDescription>Enter barber details</DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4">
//           <div>
//             <Label>Name</Label>
//             <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
//           </div>
//           <div>
//             <Label>Specialty</Label>
//             <Input value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} placeholder="e.g., Fade Expert" />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label>Experience (years)</Label>
//               <Input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})} />
//             </div>
//             <div>
//               <Label>Phone</Label>
//               <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
//             </div>
//           </div>
//           <Button onClick={() => onSave(formData)} className="w-full">
//             {editing ? 'Update' : 'Add'} Barber
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

function BarberDialog({ open, onOpenChange, onSave, editing, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    experience: "",
    phone: "",
    active: true,
  });

   useEffect(() => {
    if (!open) return;
    if (editing) {
      setFormData({
        name: editing.name || "",
        email: editing.email || "",
        password: "",
        specialty: editing.specialty || "",
        experience: editing.experience || "",
        phone: editing.phone || "",
        active: editing.active !== undefined ? editing.active : true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        specialty: "",
        experience: "",
        phone: "",
        active: true,
      });
    }
  }, [editing, open]);


  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert("Name and Email are required");
      return;
    }

    if (!editing && !formData.password) {
      alert("Password is required for new barber");
      return;
    }

    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Barber
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Barber" : "Add New Barber"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update barber details"
              : "Enter barber details. This will also create a login account."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Barber name"
            />
          </div>

          <div>
            <Label>Email * (used for login)</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="barber@fadebook.com"
              disabled={!!editing}
            />
          </div>

          {!editing && (
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Login password"
              />
            </div>
          )}

          <div>
            <Label>Specialty</Label>
            <Input
              value={formData.specialty}
              onChange={(e) =>
                setFormData({ ...formData, specialty: e.target.value })
              }
              placeholder="e.g., Haircut, Beard, Coloring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="5"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Active/Deactive Toggle */}
            {editing && (
                <>
                  <div>
                    <Label>Account Status</Label>
                    <p className="text-xs text-slate-500">
                      {formData.active
                        ? "Barber can login and receive bookings"
                        : "Barber cannot login or receive bookings"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.active}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: checked })
                    }
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-400 [&>span]:bg-white"
                  />
                </>
            )}
           
          </div>

          <Button onClick={handleSave} className="w-full">
            {editing ? "Update" : "Add"} Barber
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}