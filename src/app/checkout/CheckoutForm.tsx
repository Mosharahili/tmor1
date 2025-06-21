"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Cart, CartItem, Product } from "@prisma/client";
import { FaApple, FaCreditCard, FaMoneyBillWave, FaUniversity } from "react-icons/fa";
import Script from "next/script";

interface CartWithItems extends Cart {
  items: (CartItem & {
    product: Product;
  })[];
}

interface CheckoutFormProps {
  cart: CartWithItems;
  total: number;
}

const MOYASAR_PUBLISHABLE_KEY = "pk_test_z5MZwKtzQfRw7sUFoUVYtsotbzPBJNf6DoND2osN";

export default function CheckoutForm({ cart, total }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "CREDIT_CARD",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [moyasarReady, setMoyasarReady] = useState(false);

  useEffect(() => {
    async function checkPhone() {
      const res = await fetch("/api/profile");
      const user = await res.json();
      if (!user.phone) {
        alert("يجب إضافة رقم الهاتف لإكمال الطلب");
        router.push("/profile");
      }
    }
    checkPhone();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Checkout form submitted. moyasarReady:", moyasarReady);
    setLoading(true);
    setPaymentStatus(null);
    setShowPayment(false);
    // Validate form fields
    // ... existing validation ...
    setShowPayment(true);
    setLoading(false);
  };

  // Handle Moyasar payment completion
  const handleMoyasarPayment = async (payment: any) => {
    setPaymentStatus("جاري التحقق من الدفع...");
    setPaymentId(payment.id);
    // Verify payment with backend
    const res = await fetch("/api/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.id }),
    });
    if (!res.ok) {
      setPaymentStatus("فشل التحقق من الدفع. الرجاء المحاولة مرة أخرى.");
      return;
    }
    // Create order
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total,
          shippingInfo: formData,
        }),
      });
      if (!response.ok) throw new Error("Failed to create order");
      // Clear cart
      await fetch("/api/cart", { method: "DELETE" });
      setPaymentStatus("تم الدفع وإنشاء الطلب بنجاح!");
      router.push("/orders");
      toast.success("تم إنشاء الطلب بنجاح");
    } catch (error) {
      setPaymentStatus("تم الدفع لكن حدث خطأ أثناء إنشاء الطلب. تواصل مع الدعم.");
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const paymentMethods = [
    {
      value: "CREDIT_CARD",
      label: "بطاقة ائتمان",
      icon: <FaCreditCard className="w-6 h-6" />,
    },
    {
      value: "BANK_TRANSFER",
      label: "تحويل بنكي",
      icon: <FaUniversity className="w-6 h-6" />,
    },
    {
      value: "CASH_ON_DELIVERY",
      label: "الدفع عند الاستلام",
      icon: <FaMoneyBillWave className="w-6 h-6" />,
    },
    {
      value: "APPLE_PAY",
      label: "Apple Pay",
      icon: <FaApple className="w-6 h-6" />,
    },
    {
      value: "MADA",
      label: "مدى",
      icon: <FaCreditCard className="w-6 h-6" />,
    },
  ];

  return (
    <>
      <Script src="https://cdn.moyasar.com/js/v1/moyasar.js" strategy="beforeInteractive" onLoad={() => { setMoyasarReady(true); console.log("Moyasar script loaded (checkout)"); }} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">الدفع</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              الاسم الكامل
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              رقم الهاتف
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              العنوان
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                المدينة
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                الرمز البريدي
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.paymentMethod === method.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: method.value,
                    }))
                  }
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <span className="font-medium">{method.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            {loading ? "جاري المعالجة..." : "إتمام الطلب والدفع"}
          </button>
        </form>
        {showPayment && moyasarReady && (
          <div className="mt-6">
            <h3>الدفع عبر مدى أو Apple Pay</h3>
            <div id="moyasar-payment-checkout"></div>
            <Script id="moyasar-init" strategy="afterInteractive">
              {`
                if (window.Moyasar) {
                  window.Moyasar.init({
                    element: '#moyasar-payment-checkout',
                    amount: ${total * 100},
                    currency: 'SAR',
                    description: 'دفع طلب متجر تمور',
                    publishable_api_key: '${MOYASAR_PUBLISHABLE_KEY}',
                    methods: ['mada', 'applepay'],
                    on_completed: function(payment) {
                      window.dispatchEvent(new CustomEvent('moyasar-paid', { detail: payment }));
                    },
                    on_failed: function() {
                      alert('فشل الدفع. الرجاء المحاولة مرة أخرى.');
                    }
                  });
                }
                window.addEventListener('moyasar-paid', function(e) {
                  if (e.detail && e.detail.id) {
                    window.__handleMoyasarPayment && window.__handleMoyasarPayment(e.detail);
                  }
                });
                window.__handleMoyasarPayment = ${handleMoyasarPayment.toString()};
              `}
            </Script>
            {paymentStatus && <div className="mt-4 text-center font-bold">{paymentStatus}</div>}
          </div>
        )}
      </div>
    </>
  );
} 