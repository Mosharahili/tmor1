import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: Role;
  };
}

export default async function OrdersPage() {
  const session: ExtendedSession | null = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
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
  });

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order #{order.id.slice(-6)}</h2>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      order.status === "PENDING"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.status === "COMPLETED"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Items</h3>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        {item.product && item.product.images && item.product.images.length > 0 ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-md mr-4"></div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{item.product ? item.product.name : 'Product not available'}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Shipping Information</h3>
                    {typeof order.shippingInfo === 'object' && order.shippingInfo !== null && !Array.isArray(order.shippingInfo) ? (
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Name:</strong> {(order.shippingInfo as any).fullName}</p>
                        <p><strong>Email:</strong> {(order.shippingInfo as any).email}</p>
                        <p><strong>Phone:</strong> {(order.shippingInfo as any).phone}</p>
                        <p><strong>Address:</strong> {(order.shippingInfo as any).address}, {(order.shippingInfo as any).city}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{String(order.shippingInfo)}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-between">
                     <h3 className="font-semibold text-gray-700 mb-2">Order Summary</h3>
                     <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex justify-between"><span>Subtotal</span> <span>${order.total.toFixed(2)}</span></p>
                        {typeof order.shippingInfo === 'object' && order.shippingInfo !== null && !Array.isArray(order.shippingInfo) && (order.shippingInfo as any).paymentMethod &&
                          <p className="flex justify-between"><span>Payment Method</span> <span className="font-semibold">{(order.shippingInfo as any).paymentMethod}</span></p>
                        }
                     </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 text-right">
                      <p className="text-lg font-bold text-gray-800">
                        Total: ${order.total.toFixed(2)}
                      </p>
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