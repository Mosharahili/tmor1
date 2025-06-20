"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const userData = await res.json();
      setUser(userData);
      setPhone(userData.phone || "");
      setEmail(userData.email || "");
    }
    async function fetchOrders() {
      const res = await fetch("/api/orders");
      if (res.status === 401) return;
      const ordersData = await res.json();
      setOrders(ordersData);
    }
    fetchProfile();
    fetchOrders();
    setLoading(false);
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email }),
      });
      if (!response.ok) throw new Error("حدث خطأ أثناء الحفظ");
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex items-center justify-between">
        <span className="font-bold text-lg">رصيد المحفظة:</span>
        <span className="font-bold text-2xl text-green-700">{user.walletBalance ?? 0} ريال</span>
      </div>
      <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">معلومات الحساب</h2>
        <div className="space-y-2">
          <p><span className="font-medium">الاسم:</span> {user.name}</p>
          {editMode ? (
            <form onSubmit={handleSave} className="space-y-2">
              <div>
                <label className="font-medium">البريد الإلكتروني:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-2 py-1 ml-2" />
              </div>
              <div>
                <label className="font-medium">رقم الهاتف:</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="border rounded px-2 py-1 ml-2" />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ"}</button>
              <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => setEditMode(false)}>إلغاء</button>
            </form>
          ) : (
            <>
          <p><span className="font-medium">البريد الإلكتروني:</span> {user.email}</p>
              <p><span className="font-medium">رقم الهاتف:</span> {user.phone || <span className="text-red-500">غير مضاف</span>}</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setEditMode(true)}>تعديل</button>
            </>
          )}
          {user.role !== 'USER' && (
          <p><span className="font-medium">الدور:</span> {user.role}</p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">طلباتي</h2>
        {orders.length === 0 ? (
          <p>لا توجد طلبات حتى الآن</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">طلب #{order.id}</p>
                  <p className={`px-2 py-1 rounded text-sm ${
                    order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                    order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                    order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {order.status === "COMPLETED" ? "مكتمل" :
                     order.status === "PROCESSING" ? "قيد المعالجة" :
                     order.status === "CANCELLED" ? "ملغي" :
                     "قيد الانتظار"}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                </p>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.product?.name || item.auction?.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          الكمية: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {item.price * item.quantity} ريال
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-bold text-right">
                    المجموع: {order.total} ريال
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 