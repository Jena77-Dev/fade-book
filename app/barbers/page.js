'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, Star, User, ArrowLeft } from 'lucide-react';

export default function BarbersPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      // const res = await fetch('http://localhost:3000/api/barbers');
      const data = await api.get('/barbers');
      // const data = await res.json();
      console.log("Barbers data:", data);
      
      setBarbers(data.barbers || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">FadeBook</h1>
            </div>
            <Button onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Meet Our Barbers</h2>
          <p className="text-slate-600">Skilled professionals dedicated to your style</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map(barber => (
            <Card key={barber.barberId} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
                <CardTitle className="text-2xl">{barber.name}</CardTitle>
                <CardDescription className="text-base">{barber.specialty}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-lg">{barber.rating}</span>
                    <span className="text-slate-600">Rating</span>
                  </div>
                  <p className="text-slate-600">{barber.experience} years experience</p>
                  <p className="text-sm text-slate-500">{barber.totalBookings}+ bookings</p>
                  <Button onClick={() => router.push('/booking')} className="w-full mt-4">
                    Book with {barber.name.split(' ')[0]}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}