import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Banknote,
  Sparkles,
  Search,
  ExternalLink,
  Coffee,
  XCircle,
  Filter,
  Radio,
  Terminal,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
  LogOut,
  User,
} from 'lucide-react';
import { OrderStatus } from '../../types/cafe';

export const StaffDashboard: React.FC = () => {
  const {
    orders,
    approveCashPayment,
    updateOrderStatus,
    handleCancellation,
    viewOrderTracker,
    setViewMode,
    echoConnected,
    echoEvents,
    soundEnabled,
    setSoundEnabled,
    triggerTestEchoBroadcast,
    staffSession,
    logoutStaff,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'preparing' | 'ready' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEchoConsole, setShowEchoConsole] = useState<boolean>(false);

  const filteredOrders = orders.filter((order) => {
    // Status filter
    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = ['pending', 'preparing', 'ready'].includes(order.order_status);
    } else if (activeTab !== 'all') {
      matchesTab = order.order_status === activeTab;
    }

    // Search query
    const matchesSearch =
      order.tracking_token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Pending</span>;
      case 'preparing':
        return <span className="bg-[#5C4033] text-[#FDFBF7] px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse">Brewing</span>;
      case 'ready':
        return <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Ready</span>;
      case 'completed':
        return <span className="bg-[#EFE8E1] text-[#736357] px-2.5 py-0.5 rounded-full text-[10px] font-bold">Done</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      {/* Top Banner */}
      <div className="bg-[#F4EFEB] border-b border-[#E6DDD4] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-sm shrink-0">
              <ChefHat className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-[#2B231F]">Barista Kitchen Display (KDS)</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Live Queue
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold border border-amber-300">
                  role:staff
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                Incoming mobile orders, counter cash verification, and preparation workflow.
              </p>
            </div>
          </div>

          {/* Right controls: Staff User info, Search, and Logout */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token, customer..."
                className="w-full min-h-[44px] pl-9 pr-4 py-2 bg-white border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
              />
              <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-3.5" />
            </div>

            {/* Staff User & Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E6DDD4] rounded-xl text-xs text-[#5C4033]">
                <User className="w-3.5 h-3.5 text-[#8C7A6B]" />
                <span className="font-semibold">{staffSession?.user.name || 'Barista Staff'}</span>
              </div>

              <button
                type="button"
                id="staff-logout-btn"
                onClick={() => logoutStaff()}
                className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-[#E6DDD4] hover:border-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                title="Revoke Sanctum token & return to Staff Login"
              >
                <LogOut className="w-4 h-4 text-stone-500 hover:text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Real-time Laravel Echo & Pusher Live Status Bar */}
        <div className="mb-6 bg-[#241D19] border border-[#3E332D] rounded-2xl p-4 text-[#FDFBF7] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3E332D] flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">
                    Laravel Echo & Pusher WebSocket
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-[#A6978A] mt-0.5">
                  Subscribed: <code className="text-[#D4A373] font-mono">private-staff.orders</code> • Listening for event: <code className="text-[#FAEDCD] font-mono">App\Events\OrderPlaced</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerTestEchoBroadcast}
                className="px-3 py-1.5 rounded-xl bg-[#5C4033] hover:bg-[#6E4F3F] text-[#FDFBF7] text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                <span>Trigger Test Broadcast</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-xl border transition ${
                  soundEnabled
                    ? 'border-amber-500/40 text-amber-300 bg-[#3E332D]'
                    : 'border-[#3E332D] text-[#A6978A] bg-[#1F1A17]'
                }`}
                title={soundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowEchoConsole(!showEchoConsole)}
                className="px-2.5 py-1.5 rounded-xl bg-[#1F1A17] border border-[#3E332D] hover:bg-[#2B231F] text-[#D4C5B9] text-xs font-mono flex items-center gap-1 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Logs ({echoEvents.length})</span>
                {showEchoConsole ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expandable Live WebSocket Frame Inspector */}
          {showEchoConsole && (
            <div className="mt-4 pt-4 border-t border-[#3E332D] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-[#A6978A]">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D4A373]">
                  Live Echo Event Stream (Client Listener: Livewire v3 #[On('echo-private:staff.orders,OrderPlaced')])
                </span>
                <span className="text-[10px]">Pusher v8.4 • TLS 1.3</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar font-mono text-[11px]">
                {echoEvents.length === 0 ? (
                  <p className="text-xs text-[#8C7A6B] py-2">No broadcast events captured yet.</p>
                ) : (
                  echoEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-[#191412] border border-[#332A25] rounded-xl p-2.5 text-xs text-[#E5DCD1] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400" />
                          {evt.event}
                        </span>
                        <span className="text-[#8C7A6B]">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A6978A]">
                        Channel: <span className="text-[#D4A373]">{evt.channel}</span> | Order: <span className="text-white font-bold">#{evt.payload.tracking_token}</span> ({evt.payload.customer_name}) | Total: <span className="text-emerald-300 font-bold">₱{evt.payload.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#EFE8E1]">
          {[
            { id: 'active', label: 'Active Queue' },
            { id: 'pending', label: 'Pending Payment' },
            { id: 'preparing', label: 'In Kitchen (Brewing)' },
            { id: 'ready', label: 'Ready for Claim' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow-sm'
                  : 'bg-[#F4EFEB] text-[#736357] hover:bg-[#E6DDD4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Card Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isCashUnpaid = order.payment_method === 'cash' && order.payment_status === 'unpaid';
            const hasCancelRequest = order.cancellation_requested;

            return (
              <div
                key={order.id}
                className={`bg-[#FDFBF7] border-2 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition ${
                  hasCancelRequest
                    ? 'border-amber-400 bg-amber-50/20'
                    : isCashUnpaid
                    ? 'border-amber-200'
                    : order.order_status === 'ready'
                    ? 'border-emerald-300'
                    : 'border-[#EFE8E1]'
                }`}
              >
                <div>
                  {/* Top Bar: Token, Status, Elapsed */}
                  <div className="flex items-center justify-between border-b border-[#F4EFEB] pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-sm font-extrabold text-[#5C4033]">
                          #{order.tracking_token}
                        </span>
                        {getStatusBadge(order.order_status)}
                        {echoEvents.some((e) => e.payload.tracking_token === order.tracking_token) && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                            Live Echo
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8C7A6B] block mt-0.5">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-[#5C4033] bg-[#EFE8E1] px-2.5 py-1 rounded-full border border-[#E6DDD4]">
                        {order.order_type === 'dine-in'
                          ? 'Dine-in'
                          : order.order_type === 'delivery'
                          ? 'Delivery'
                          : 'Take-out'}
                      </span>
                      <p className="text-xs font-bold text-[#2B231F] mt-1">{order.customer_name}</p>
                      {order.delivery_details && (
                        <p className="text-[10px] text-[#7A6253] mt-0.5 max-w-[200px] truncate text-right">
                          📍 {order.delivery_details.address}, {order.delivery_details.city_region}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ready - Name Calling Notification for Barista / Cashier */}
                  {order.order_status === 'ready' && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-800 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                            Order Ready — Call Customer:
                          </span>
                          <span className="text-xs font-extrabold text-[#2B231F]">
                            "{order.customer_name}" (Token #{order.tracking_token})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                        Call Counter
                      </span>
                    </div>
                  )}

                  {/* Cancellation Request Warning Banner */}
                  {hasCancelRequest && (
                    <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded-2xl">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900">
                          <p className="font-bold">Customer Requested Cancellation</p>
                          <p className="text-[11px] text-amber-800 italic mt-0.5">
                            "{order.cancellation_reason || 'No reason specified'}"
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleCancellation(order.id, true)}
                              className="px-3 py-1 bg-[#DC2626] text-white text-[11px] font-bold rounded-full shadow-xs"
                            >
                              Approve Cancel
                            </button>
                            <button
                              onClick={() => handleCancellation(order.id, false)}
                              className="px-3 py-1 bg-white border border-amber-300 text-amber-900 text-[11px] font-bold rounded-full"
                            >
                              Reject & Continue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Alert Banner if Cash Unpaid */}
                  {isCashUnpaid && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                          Unpaid Counter Cash
                        </span>
                        <span className="text-xs font-extrabold text-[#5C4033]">
                          Collect ₱{order.total_amount.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => approveCashPayment(order.id)}
                        className="px-3.5 py-1.5 bg-[#5C4033] text-[#FDFBF7] text-xs font-bold rounded-full shadow hover:bg-[#4A3328] transition"
                      >
                        Confirm Payment
                      </button>
                    </div>
                  )}

                  {/* Online Paid Badge */}
                  {order.payment_status === 'paid' && (
                    <div className="mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Paid via {order.payment_method.toUpperCase()}</span>
                      </span>
                      <span className="font-bold text-emerald-900">₱{order.total_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Item Breakdown */}
                  <div className="mt-4 space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-[#F4EFEB] p-2.5 rounded-xl border border-[#E6DDD4] text-xs">
                        <div className="flex justify-between font-bold text-[#2B231F]">
                          <span>{item.quantity}x {item.item_name}</span>
                          <span className="text-[#5C4033]">₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>

                        {/* Customization Details */}
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#736357]">
                          {item.customizations.size && (
                            <span className="bg-[#EFE8E1] px-1.5 py-0.5 rounded font-semibold text-[#5C4033]">
                              {item.customizations.size}
                            </span>
                          )}
                          {item.customizations.milk_type === 'oat' && (
                            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                              Oat Milk
                            </span>
                          )}
                          {item.customizations.add_ons?.map((a) => (
                            <span key={a.id} className="bg-[#EFE8E1] px-1.5 py-0.5 rounded">
                              +{a.name}
                            </span>
                          ))}
                        </div>

                        {item.customizations.comments && (
                          <p className="mt-1 text-[10px] text-[#5C4033] italic bg-white/60 p-1 rounded">
                            Note: "{item.customizations.comments}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Stage Progress Actions */}
                <div className="mt-5 pt-3 border-t border-[#F4EFEB] flex items-center justify-between gap-2">
                  {/* Customer view preview button */}
                  <button
                    onClick={() => {
                      viewOrderTracker(order.tracking_token);
                      setViewMode('customer');
                    }}
                    className="p-2 text-[#8C7A6B] hover:text-[#5C4033] hover:bg-[#EFE8E1] rounded-full transition"
                    title="View Customer Mobile Tracker"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {order.order_status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full py-2.5 px-3 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] text-xs font-bold rounded-full shadow-xs transition text-center"
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.order_status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-full shadow-xs transition text-center"
                      >
                        Mark Ready for Claim
                      </button>
                    )}

                    {order.order_status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full py-2.5 px-3 bg-[#2B231F] hover:bg-black text-[#FDFBF7] text-xs font-bold rounded-full shadow-xs transition text-center"
                      >
                        Complete Order
                      </button>
                    )}

                    {order.order_status === 'completed' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    )}

                    {order.order_status === 'cancelled' && (
                      <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-24 text-center">
            <Coffee className="w-12 h-12 text-[#D9CDC1] mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-[#2B231F]">No Orders in This View</h3>
            <p className="text-xs text-[#8C7A6B] mt-1">
              Switch filter tabs or place a test order from the Customer Mobile App.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
