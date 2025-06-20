import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import { Order, OrderItem, Product } from "@prisma/client";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Product;
  })[];
}

interface ShippingInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  paymentMethod?: string;
}

function formatOrderNumber(order: Order) {
  const date = new Date(order.createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  // Use last 5 digits of order.id (if not enough, pad with zeros)
  const idPart = order.id.replace(/\D/g, '').slice(-5).padStart(5, '0');
  return `${year}${month}${day}${idPart}`;
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions) as ExtendedSession;

  if (!session?.user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as OrderWithItems[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">طلباتي</h1>
      {orders.length === 0 ? (
        <p>لا توجد طلبات</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      رقم الطلب: {formatOrderNumber(order)}
                    </p>
                    <p className="text-sm text-gray-600">
                      تاريخ الطلب:{" "}
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      الحالة:{" "}
                      <span
                        className={`$${
                          order.status === "COMPLETED"
                            ? "text-green-600"
                            : order.status === "CANCELLED"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {order.status === "PENDING"
                          ? "قيد الانتظار"
                          : order.status === "PROCESSING"
                          ? "قيد المعالجة"
                          : order.status === "COMPLETED"
                          ? "مكتمل"
                          : "ملغي"}
                      </span>
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {order.total} ريال
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-4">تفاصيل الطلب</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product ? item.product.name : "منتج محذوف"}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {item.price} ريال
                        </p>
                      </div>
                      <p className="font-semibold">
                        {item.price * item.quantity} ريال
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2">معلومات التوصيل</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">الاسم</p>
                      <p>{order.shippingInfo?.fullName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">البريد الإلكتروني</p>
                      <p>{order.shippingInfo?.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">رقم الهاتف</p>
                      <p>{order.shippingInfo?.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">العنوان</p>
                      <p>{order.shippingInfo?.address || "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">المدينة</p>
                      <p>{order.shippingInfo?.city || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 