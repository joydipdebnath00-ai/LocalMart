import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import {
  FileText,
  Search,
  ShieldCheck,
  Lock,
  Filter,
  Clock,
  Terminal,
  Activity,
} from 'lucide-react';

export const AdminAuditLogsTab: React.FC = () => {
  const { auditLogs } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const actionTypes = Array.from(new Set(auditLogs.map((l) => l.action)));

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetObject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.oldValue && log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Immutable Platform Audit Trail</h2>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Every privileged administrative operation, database mutation, policy suspension, and refund is recorded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, target ID, diffs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Actions ({auditLogs.length})</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Security Banner Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3 text-xs text-slate-400">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
        <div>
          <strong className="text-slate-300 font-semibold">Regulatory & Compliance Integrity: </strong>
          Audit logs are tamper-proof and cannot be deleted or purged by standard console operators. Cryptographic session IDs and source IP addresses are preserved.
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-800/80 text-slate-300 font-sans font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Target Object & ID</th>
                <th className="py-3 px-4">Mutation / Delta Values</th>
                <th className="py-3 px-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCritical =
                    log.action.includes('SUSPEND') ||
                    log.action.includes('DELETE') ||
                    log.action.includes('CANCEL') ||
                    log.action.includes('REFUND');

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-sans">
                        <div className="font-semibold text-white">{log.adminName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.adminId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : log.action.includes('APPROVED') || log.action.includes('VERIFIED')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="text-slate-400 font-sans font-medium">{log.targetObject}: </span>
                        <span className="text-white font-bold">{log.targetId}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 max-w-xs">
                        {log.oldValue && (
                          <div className="text-[10px] text-rose-400 truncate">
                            <span className="text-slate-500 font-sans">Old:</span> {log.oldValue}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-[10px] text-emerald-400 truncate">
                            <span className="text-slate-500 font-sans">New:</span> {log.newValue}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
