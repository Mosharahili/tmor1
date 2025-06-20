"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  images: string[];
  winner?: { name?: string; email?: string };
}

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startPrice: "",
    startDate: "",
  });

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch("/api/auctions");
      if (!response.ok) throw new Error("Failed to fetch auctions");
      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError("حدث خطأ أثناء جلب المزادات");
    }
  };

  const handleAddAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startPrice: parseFloat(formData.startPrice),
          images: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to add auction");
      
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        startPrice: "",
        startDate: "",
      });
      fetchAuctions();
    } catch (err) {
      setError("حدث خطأ أثناء إضافة المزاد");
    }
  };

  const handleEditAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction) return;

    try {
      const response = await fetch(`/api/auctions/${selectedAuction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          startPrice: parseFloat(formData.startPrice),
          images: selectedAuction.images,
        }),
      });

      if (!response.ok) throw new Error("Failed to edit auction");
      
      setShowEditModal(false);
      setSelectedAuction(null);
      setFormData({
        title: "",
        description: "",
        startPrice: "",
        startDate: "",
      });
      fetchAuctions();
    } catch (err) {
      setError("حدث خطأ أثناء تعديل المزاد");
    }
  };

  const handleDeleteAuction = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المزاد؟")) return;

    try {
      const response = await fetch(`/api/auctions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete auction");
      fetchAuctions();
    } catch (err) {
      setError("حدث خطأ أثناء حذف المزاد");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/auctions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      fetchAuctions();
    } catch (err) {
      setError("حدث خطأ أثناء تحديث حالة المزاد");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المزادات</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          <FaPlus /> إضافة مزاد جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر الابتدائي</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفائز</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auctions.map((auction) => (
              <tr key={auction.id}>
                <td className="px-6 py-4 whitespace-nowrap">{auction.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{auction.startPrice} ريال</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(auction.startDate).toLocaleString("ar-SA")}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${auction.status === "ACTIVE" ? "bg-green-100 text-green-800" : auction.status === "UPCOMING" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{auction.status === "ACTIVE" ? "نشط" : auction.status === "UPCOMING" ? "قادم" : "منتهي"}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {auction.status === "ENDED" && auction.winner ? (
                    <span>
                      {auction.winner.name || auction.winner.email} ({auction.currentPrice} ريال)
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  {auction.status === "UPCOMING" && (
                    <button
                      onClick={() => handleStatusChange(auction.id, "ACTIVE")}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      بدء المزاد
                    </button>
                  )}
                  {auction.status === "ACTIVE" && (
                    <button
                      onClick={() => handleStatusChange(auction.id, "ENDED")}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      إنهاء المزاد
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedAuction(auction);
                      setFormData({
                        title: auction.title,
                        description: auction.description,
                        startPrice: auction.startPrice.toString(),
                        startDate: new Date(auction.startDate).toISOString().slice(0, 16),
                      });
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 ml-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteAuction(auction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة مزاد جديد</h2>
            <form onSubmit={handleAddAuction}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">العنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">السعر الابتدائي</label>
                <input
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">تاريخ البداية</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedAuction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">تعديل المزاد</h2>
            <form onSubmit={handleEditAuction}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">العنوان</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">السعر الابتدائي</label>
                <input
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">تاريخ البداية</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 