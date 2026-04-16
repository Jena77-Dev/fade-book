'use client';

import { useState, useEffect } from 'react';
import api from "lib/api";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Calendar, Clock, User, LogOut, ArrowLeft } from 'lucide-react';

export default function MyBookingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchBookings(parsedUser);
  }, []);

  const fetchBookings = async (userData) => {
    try {
      // Fetch appointments for this customer
      // const res = await fetch(`http://localhost:3000/api/appointments?customerEmail=${userData.email}`);
      const data = await api.get(`/appointments?customerEmail=${userData.email}`);
      // const data = await res.json();
      setBookings(data.appointments || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">My Bookings</h1>
                <p className="text-sm text-slate-600">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button onClick={() => router.push('/booking')} className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking.appointmentId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{booking.serviceName}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-4 w-4" />
                          <span>Barber: {booking.barberName}</span>
                        </div>
                      </div>
                      <Badge className={
                        booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="font-semibold">{booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="font-semibold">{booking.timeSlot}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="font-semibold text-green-600">₹{booking.totalAmount}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-slate-500">Payment</p>
                        <p className="font-semibold">{booking.paymentStatus || 'Pending'}</p>
                      </div>
                    </div>
                    
                    {booking.notes && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Bookings Yet</h3>
                <p className="text-slate-600 mb-6">You haven't made any appointments yet</p>
                <Button onClick={() => router.push('/booking')} className="bg-blue-600 hover:bg-blue-700">
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}