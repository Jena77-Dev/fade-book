'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Scissors, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setImages(data.images || []);
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
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Our Work Gallery</h2>
          <p className="text-slate-600">See our amazing transformations</p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(image => (
              <div key={image.imageId} className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-slate-400" />
                </div>
                <div className="bg-white p-4">
                  <h3 className="font-semibold">{image.title || 'Styling Work'}</h3>
                  <p className="text-sm text-slate-600">{image.description || 'Professional styling'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ImageIcon className="h-24 w-24 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Gallery coming soon! Check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}