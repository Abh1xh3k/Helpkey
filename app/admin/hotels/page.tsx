'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditHotelModal from '@/components/EditHotelModal';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';

export default function HotelManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<{id: string, name: string} | null>(null);

  // Fetch hotels from Firestore
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const hotelsQuery = query(collection(db, 'hotels'));
        const querySnapshot = await getDocs(hotelsQuery);
        
        const hotelsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to Date if needed
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }));
        
        setHotels(hotelsData);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditClick = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (hotel: {id: string, name: string}) => {
    setHotelToDelete(hotel);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    
    try {
      // Delete the hotel document from Firestore
      await deleteDoc(doc(db, 'hotels', hotelToDelete.id));
      
      // Update the local state to remove the deleted hotel
      setHotels(hotels.filter(hotel => hotel.id !== hotelToDelete.id));
      
      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setHotelToDelete(null);
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel. Please try again.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setHotelToDelete(null);
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || hotel.status?.toLowerCase() === filterBy.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name);
      case 'location':
        return a.location?.localeCompare(b.location);
      case 'rooms':
        return (b.rooms || 0) - (a.rooms || 0);
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      case 'occupancy':
        return (b.occupancy || 0) - (a.occupancy || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
            <p className="text-gray-600 mt-2">Manage your hotel properties</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin" className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              Back to Dashboard
            </Link>
            <Link href="/admin/hotels/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Add New Hotel
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Hotels</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-3 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or location..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="name">Name</option>
                <option value="location">Location</option>
                <option value="rooms">Number of Rooms</option>
                <option value="revenue">Revenue</option>
                <option value="occupancy">Occupancy Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading hotels...</p>
          </div>
        )}

        {/* Hotels Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-48 object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                      {hotel.status || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center">
                      {[...Array(hotel.stars || 0)].map((_, i) => (
                        <i key={i} className="ri-star-fill text-yellow-400 text-sm w-4 h-4 flex items-center justify-center"></i>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 flex items-center mb-4">
                    <i className="ri-map-pin-line mr-2 w-4 h-4 flex items-center justify-center"></i>
                    {hotel.location}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Rooms</p>
                      <p className="text-lg font-semibold text-gray-900">{hotel.rooms || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Occupancy</p>
                      <p className="text-lg font-semibold text-gray-900">{hotel.occupancy ? `${hotel.occupancy}%` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <p className="text-lg font-semibold text-green-600">
                      {hotel.revenue ? `$${hotel.revenue.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/admin/hotels/${hotel.id}`} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-center text-sm">
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleEditClick(hotel.id)}
                      className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick({id: hotel.id, name: hotel.name})}
                      className="flex-1 border border-red-300 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap text-center text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedHotels.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <i className="ri-hotel-line text-4xl text-gray-400 mb-4 w-16 h-16 flex items-center justify-center mx-auto"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-600 mb-4">No hotels match your current search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Edit Hotel Modal */}
      <EditHotelModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        hotelId={selectedHotelId}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the hotel "{hotelToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}