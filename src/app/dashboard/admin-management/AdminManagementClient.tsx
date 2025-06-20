'use client';

import { User } from '@prisma/client';

interface AdminManagementClientProps {
  admins: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>[];
}

export default function AdminManagementClient({ admins }: AdminManagementClientProps) {
  const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await fetch('/api/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'حدث خطأ أثناء إضافة المدير');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('حدث خطأ أثناء إضافة المدير');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المدير؟')) {
      try {
        const response = await fetch('/api/admin/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminId }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert('حدث خطأ أثناء حذف المدير');
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('حدث خطأ أثناء حذف المدير');
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-right">إدارة المدراء</h1>
      
      {/* نموذج إضافة مدير جديد */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4 text-right">إضافة مدير جديد</h2>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block mb-1 text-right">الاسم</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2 text-right"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2 text-right"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-right">كلمة المرور</label>
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2 text-right"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800"
          >
            إضافة مدير
          </button>
        </form>
      </div>

      {/* قائمة المدراء الحاليين */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-right">المدراء الحاليون</h2>
        <div className="space-y-4">
          {admins.map((admin) => (
            <div key={admin.id} className="flex justify-between items-center border-b pb-4">
              <div className="text-right">
                <p className="font-bold">{admin.name}</p>
                <p className="text-gray-600">{admin.email}</p>
                <p className="text-sm text-gray-500">
                  تاريخ الإنشاء: {new Date(admin.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <button
                onClick={() => handleDeleteAdmin(admin.id)}
                className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 