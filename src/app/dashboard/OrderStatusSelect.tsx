"use client";

import { useState } from "react";

interface OrderStatusSelectProps {
  orderId: string;
  status: string;
}

export default function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLoading(true);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      setCurrentStatus(value);
      window.location.reload();
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      className="border rounded px-2 py-1"
      disabled={loading}
    >
      <option value="PENDING">قيد الانتظار</option>
      <option value="PROCESSING">قيد المعالجة</option>
      <option value="COMPLETED">مكتمل</option>
      <option value="CANCELLED">ملغي</option>
    </select>
  );
} 