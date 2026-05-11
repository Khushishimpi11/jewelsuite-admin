import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Star, Filter, Search, Trash2, Star as StarIcon, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = "http://localhost:5000/api";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/all?status=${filter}&search=${searchTerm}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/${id}/approve`, { method: 'PUT' });
      if (response.ok) {
        toast.success('Review approved successfully');
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (response.ok) {
        toast.success('Review rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/admin/${id}/feature`, { method: 'PUT' });
      if (response.ok) {
        toast.success(isFeatured ? 'Removed from featured' : 'Added to featured');
        fetchReviews();
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews/admin/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Review deleted');
          fetchReviews();
          fetchStats();
        }
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      published: 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-primary">{stats.total || 0}</div>
          <div className="text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          <div className="text-gray-600">Pending Approval</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
          <div className="text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-primary">{stats.averageRating || 0}</div>
          <div className="text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md capitalize ${
                  filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchReviews()}
              className="pl-10 pr-4 py-2 border rounded-md w-64"
            />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8">No reviews found</td></tr>
              ) : (
                reviews.map((review: any) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{review.customerName}</div>
                        <div className="text-sm text-gray-500">{review.customerEmail}</div>
                        <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {review.productImage && (
                          <img src={review.productImage} alt={review.productName} className="w-8 h-8 object-cover rounded" />
                        )}
                        <span className="text-sm">{review.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-md truncate">{review.comment}</p>
                      {review.title && <p className="text-xs text-gray-500 mt-1">{review.title}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-1">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{review.images.length}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(review.status)}`}>
                        {review.status}
                      </span>
                      {review.isFeatured && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gold/10 text-gold">Featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(review._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {review.status === 'approved' && (
                          <button
                            onClick={() => handleFeature(review._id, review.isFeatured)}
                            className={`${review.isFeatured ? 'text-yellow-600' : 'text-gray-600'} hover:text-yellow-800`}
                            title={review.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Review</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full p-2 border rounded-md mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={() => handleReject(selectedReview._id)} className="px-4 py-2 bg-red-600 text-white rounded-md">Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Review Details</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-medium">Customer</label>
                <p>{selectedReview.customerName} ({selectedReview.customerEmail})</p>
              </div>
              <div>
                <label className="font-medium">Product</label>
                <p>{selectedReview.productName}</p>
              </div>
              <div>
                <label className="font-medium">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {selectedReview.title && (
                <div>
                  <label className="font-medium">Title</label>
                  <p>{selectedReview.title}</p>
                </div>
              )}
              <div>
                <label className="font-medium">Review</label>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <label className="font-medium">Images</label>
                  <div className="flex gap-2 mt-2">
                    {selectedReview.images.map((img, idx) => (
                      <img key={idx} src={img.url} alt="Review" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;