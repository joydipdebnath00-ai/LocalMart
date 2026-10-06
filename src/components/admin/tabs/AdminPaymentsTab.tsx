import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import {
  CreditCard,
  IndianRupee,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Lock,
  ArrowDownRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const AdminPaymentsTab: React.FC = () => {
  const { payments, orders, settings, financialStats, initiateRefund } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'RAZORPAY' | 'COD'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'REFUNDED'>('ALL');

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handleManualRefund = (p: typeof payments[0]) => {
    const amountStr = prompt(`Execute Razorpay Refund for ${p.orderId}:`, String(p.amount));
    if (amountStr && !isNaN(Number(amountStr))) {
      const reason = prompt('Refund reason for Razorpay audit log:', 'Customer return / reconciliation') || 'General dispute';
      initiateRefund(p.orderId, Number(amountStr), reason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Payment Gateway & Financial Reconciliation</h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Razorpay Verified API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict HMAC verification, transaction reconciliations, escrow splits, and automated refund tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tx ID, Razorpay ID, order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Methods</option>
            <option value="RAZORPAY">Razorpay Online</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Settled (PAID)</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Online Razorpay Settlements</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {settings.currencySymbol}{financialStats.onlineSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Direct card, UPI & Netbanking capture</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Cash On Delivery Reconciled</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {settings.currencySymbol}{financialStats.codSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300 mt-1">Verified physical courier cash drop</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Platform Commission Retained</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300">
            {settings.currencySymbol}{financialStats.platformCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Automatically computed on backend</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Refunds Disbursed</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-300">
            {settings.currencySymbol}{financialStats.refundsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Via Razorpay Reverse Ledger</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Order Link</th>
                <th className="py-3 px-4">Customer & Merchant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method & Gateway IDs</th>
                <th className="py-3 px-4">Status & Audit Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-[11px]">{p.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(p.createdAt).toLocaleTimeString()} · {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-indigo-300">
                      {p.orderId}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-semibold text-white">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400">{p.shopName}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {settings.currencySymbol}{p.amount}
                      {p.refundAmount && (
                        <div className="text-[10px] text-rose-400 font-normal">
                          Refunded: {settings.currencySymbol}{p.refundAmount}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        {p.method === 'RAZORPAY' ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CreditCard className="w-3 h-3" /> Razorpay
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400">
                            <IndianRupee className="w-3 h-3" /> Cash on Delivery
                          </span>
                        )}
                      </div>
                      {p.razorpayPaymentId && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          PayID: {p.razorpayPaymentId}
                        </div>
                      )}
                      {p.razorpayOrderId && (
                        <div className="text-[10px] font-mono text-slate-500">
                          OrdID: {p.razorpayOrderId}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          p.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.status === 'REFUNDED'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.auditNote && (
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]" title={p.auditNote}>
                          {p.auditNote}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {p.status === 'PAID' && (
                        <button
                          onClick={() => handleManualRefund(p)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 rounded-lg text-xs font-medium transition ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
