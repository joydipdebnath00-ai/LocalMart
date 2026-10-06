import React, { useState } from 'react';
import { usePlatform } from '../../../context/PlatformContext';
import { SupportTicket } from '../../../types';
import {
  LifeBuoy,
  MessageSquare,
  Search,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  User,
  Store,
  Bike,
  Plus,
} from 'lucide-react';

export const AdminSupportTab: React.FC = () => {
  const { supportTickets, replySupportTicket, updateTicketStatus, createSupportTicket, currentUser } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(supportTickets[0] || null);

  // Reply form state
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // New ticket modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketRole, setTicketRole] = useState<'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_PARTNER'>('CUSTOMER');

  const filteredTickets = supportTickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    replySupportTicket(selectedTicket.id, replyText.trim(), isInternalNote);
    setReplyText('');
    setIsInternalNote(false);

    // Update local selected ticket view
    const updated = supportTickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleCreateNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createSupportTicket({
      userId: 'usr_manual',
      userName: ticketRole === 'CUSTOMER' ? 'Priya Sharma' : ticketRole === 'SHOP_OWNER' ? 'Royal Spice Kitchen' : 'Rahul Sharma (Courier)',
      userRole: ticketRole,
      subject: ticketSubject,
      message: ticketMessage,
      category: 'ORDER',
      priority: 'MEDIUM',
      status: 'OPEN',
    });
    setSelectedTicket(created);
    setIsNewTicketModalOpen(false);
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white">Marketplace Support Desk</h2>
          <p className="text-xs text-slate-400">
            Omnichannel resolution desk for buyers, merchant partners, and courier escalations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Incoming Ticket</span>
          </button>
        </div>
      </div>

      {/* Two-Pane Ticket Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left: Tickets List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket #, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[520px]">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No tickets found.</div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedTicket?.id === t.id
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono font-bold text-white text-[11px]">{t.ticketNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        t.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="font-semibold text-white line-clamp-1 mb-1">{t.subject}</div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      {t.userRole === 'CUSTOMER' ? (
                        <User className="w-3 h-3 text-emerald-400" />
                      ) : t.userRole === 'SHOP_OWNER' ? (
                        <Store className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <Bike className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{t.userName}</span>
                    </span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Ticket Conversation & Resolution */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Header of selected ticket */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                      <span className="font-mono text-xs text-slate-400">({selectedTicket.ticketNumber})</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>From: <strong className="text-white">{selectedTicket.userName}</strong> ({selectedTicket.userRole})</span>
                      <span>·</span>
                      <span>Priority: <strong className="text-amber-400">{selectedTicket.priority}</strong></span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      const newSt = e.target.value as any;
                      updateTicketStatus(selectedTicket.id, newSt);
                      setSelectedTicket({ ...selectedTicket, status: newSt });
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                    <option value="WAITING_FOR_USER">Status: WAITING FOR USER</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>

                {/* Initial Query */}
                <div className="bg-slate-800/50 rounded-xl p-3.5 mb-4 border border-slate-700/60 text-xs">
                  <div className="font-semibold text-slate-300 mb-1">Original Issue Inquiry:</div>
                  <p className="text-slate-200 leading-relaxed">{selectedTicket.message}</p>
                </div>

                {/* Replies Thread */}
                <div className="space-y-3 max-h-[260px] overflow-y-auto mb-4 pr-1">
                  {selectedTicket.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-xl text-xs ${
                        rep.isInternal
                          ? 'bg-amber-950/20 border border-amber-500/30 text-amber-200'
                          : rep.senderRole === 'SUPER_ADMIN'
                          ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 ml-4'
                          : 'bg-slate-800/60 border border-slate-700 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400">
                        <span className="font-semibold flex items-center gap-1">
                          {rep.isInternal && <Lock className="w-3 h-3 text-amber-400" />}
                          {rep.senderName} ({rep.isInternal ? 'Internal Staff Note' : rep.senderRole})
                        </span>
                        <span>{new Date(rep.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="leading-relaxed">{rep.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-3 text-xs mb-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Private Internal Staff Note (Invisible to User)</span>
                    </span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={isInternalNote ? 'Write internal note for admin audit log...' : 'Type response to user...'}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition ${
                      isInternalNote
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Save Note' : 'Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              Select a ticket from the left panel to inspect and reply.
            </div>
          )}
        </div>
      </div>

      {/* New Simulation Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Simulate User Support Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create an incoming query to test the admin triage workflow.
            </p>

            <form onSubmit={handleCreateNewTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">User Role</label>
                <select
                  value={ticketRole}
                  onChange={(e) => setTicketRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="CUSTOMER">Customer (Buyer)</option>
                  <option value="SHOP_OWNER">Shop Owner (Vendor)</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner (Rider)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order delayed / Payment inquiry"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe inquiry..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
