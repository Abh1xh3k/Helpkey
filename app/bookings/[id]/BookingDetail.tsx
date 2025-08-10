'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface BookingDetailProps {
  bookingId: string;
}

interface BookingData {
  id: string;
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  bookingRef: string;
  status: string;
  roomType: string;
  roomSize: string;
  beds: string;
  bookedDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  image: string;
  roomImage: string;
  priceBreakdown: {
    roomRate: number;
    nights: number;
    subtotal: number;
    taxes: number;
    fees: number;
    total: number;
  };
  amenities: string[];
  hotelContact: {
    phone: string;
    email: string;
    address: string;
  };
}

export default function BookingDetail({ bookingId }: BookingDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch booking from Firestore
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
        
        if (!bookingDoc.exists()) {
          setError('Booking not found');
          return;
        }

        const bookingData = bookingDoc.data();
        
        // Fetch hotel details
        const hotelDoc = await getDoc(doc(db, 'hotels', bookingData.hotelId));
        const hotelData = hotelDoc.exists() ? hotelDoc.data() : {};

        // Combine booking and hotel data
        const combinedData: BookingData = {
          id: bookingDoc.id,
          hotelName: hotelData.name || 'Hotel Name Not Available',
          location: hotelData.location || 'Location Not Available',
          checkIn: bookingData.checkIn || '',
          checkOut: bookingData.checkOut || '',
          guests: bookingData.guests || 1,
          rooms: bookingData.rooms || 1,
          totalPrice: bookingData.totalPrice || 0,
          bookingRef: bookingData.bookingRef || bookingId,
          status: bookingData.status || 'Pending',
          roomType: bookingData.roomType || 'Standard Room',
          roomSize: bookingData.roomSize || 'Not specified',
          beds: bookingData.beds || 'Not specified',
          bookedDate: bookingData.bookedDate || new Date().toISOString(),
          guestName: bookingData.guestName || 'Guest Name',
          guestEmail: bookingData.guestEmail || 'Not provided',
          guestPhone: bookingData.guestPhone || 'Not provided',
          specialRequests: bookingData.specialRequests || '',
          image: hotelData.image || 'https://via.placeholder.com/800x400?text=Hotel+Image',
          roomImage: bookingData.roomImage || 'https://via.placeholder.com/600x400?text=Room+Image',
          priceBreakdown: {
            roomRate: bookingData.priceBreakdown?.roomRate || 0,
            nights: bookingData.priceBreakdown?.nights || 0,
            subtotal: bookingData.priceBreakdown?.subtotal || 0,
            taxes: bookingData.priceBreakdown?.taxes || 0,
            fees: bookingData.priceBreakdown?.fees || 0,
            total: bookingData.priceBreakdown?.total || 0
          },
          amenities: bookingData.amenities || [],
          hotelContact: {
            phone: hotelData.contact?.phone || 'Not available',
            email: hotelData.contact?.email || 'Not available',
            address: hotelData.contact?.address || hotelData.location || 'Not available'
          }
        };

        setBooking(combinedData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-4">
              <i className="ri-error-warning-line text-5xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error || 'Booking not found'}</p>
            <Link href="/bookings" className="mt-4 inline-block text-blue-600 hover:text-blue-700 cursor-pointer">
              Back to My Bookings
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/bookings" className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Back to My Bookings
          </Link>
        </div>

        {/* Booking Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
              <p className="text-gray-600">Booking Reference: {booking.bookingRef}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Check-in</p>
              <p className="font-semibold text-lg">{formatDate(booking.checkIn)}</p>
              <p className="text-sm text-gray-600">3:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out</p>
              <p className="font-semibold text-lg">{formatDate(booking.checkOut)}</p>
              <p className="text-sm text-gray-600">11:00 AM</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-lg">{calculateNights()} nights</p>
              <p className="text-sm text-gray-600">{booking.guests} guests, {booking.rooms} room</p>
            </div>
          </div>
        </div>

        {/* Hotel Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img 
                src={booking.image}
                alt={booking.hotelName}
                className="w-full h-64 object-cover object-top rounded-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.hotelName}</h2>
              <p className="text-gray-600 flex items-center mb-4">
                <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                {booking.location}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <i className="ri-phone-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.phone}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.email}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-map-pin-2-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                  <span className="text-gray-700">{booking.hotelContact.address}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.amenities.map(amenity => (
                  <span key={amenity} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and other sections */}
        
      </div>
      <Footer />
    </div>
  );
}