import React from 'react';
import {
  Clock,
  CheckCircle,
  Truck,
  Play,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const BookingStatusBadge = ({ status, type = 'booking' }) => {
  if (type === 'payment') {
    const isPaid = status === 'PAID';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isPaid
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {status === 'PAID' ? 'Paid' : 'Payment Pending'}
      </span>
    );
  }

  const statusConfig = {
    PENDING: {
      label: 'Pending Confirmation',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: CheckCircle,
    },
    ON_THE_WAY: {
      label: 'On The Way',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: Truck,
    },
    STARTED: {
      label: 'In Progress',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: Play,
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCheck,
    },
    REJECTED: {
      label: 'Declined',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
