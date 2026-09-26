import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  ChefHat,
  Search,
  ExternalLink,
  Coffee,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Receipt,
  Eye,
  Banknote,
  Volume2,
  VolumeX,
  LogOut,
  User,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/cafe';
import { OrderVerificationModal } from './OrderVerificationModal';
import { Header } from '../common/Header';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';

export const StaffDashboard: React.FC = () => {
  const {
    orders,
    verifyAndAcceptOrder,
    rejectOrder,
    updateOrderStatus,
    handleCancellation,
    viewOrderTracker,
    setViewMode,
    soundEnabled,
    setSoundEnabled,
    staffSession,
    logoutUnified,
  } = useCafe();

  const [activeTab, setActiveTab] = useState<'active' | 'preparing' | 'ready' | 'completed' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Unsaved changes guard: prevent refresh/navigation when reviewing an inline payment verification modal
  useUnsavedChangesGuard({
    when: inspectingOrder !== null,
    role: 'staff',
    reason: inspectingOrder
      ? `Payment verification modal open for Order #${inspectingOrder.order_number || inspectingOrder.tracking_token}`
      : 'Order verification in progress',
  });

  // Unverified pending verification count for Active Queue badge
  const unverifiedPaymentCount = orders.filter(
    (o) => o.order_status === 'pending'
  ).length;

  const filteredOrders = orders
    .filter((order) => {
      // Status filter: 'active' queue includes pending verification, preparing, and ready
      let matchesTab = true;
      if (activeTab === 'active') {
        matchesTab = ['pending', 'preparing', 'ready'].includes(order.order_status);
      } else if (activeTab !== 'all') {
        matchesTab = order.order_status === activeTab;
      }

      // Search query matches order number, token, customer name, or contact number
      const matchesSearch =
        (order.order_number ? String(order.order_number).includes(searchQuery) : false) ||
        order.tracking_token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.delivery_details?.contact_number || '').includes(searchQuery);

      return matchesTab && matchesSearch;
    })
    // Oldest orders first, so staff work through the queue top-down
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const getStatusBadge = (order: Order) => {
    if (order.order_status === 'pending') {
      return (
        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold animate-pulse inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-700" />
          <span>Unverified Payment</span>
        </span>
      );
    }
    if (order.order_status === 'preparing') {
      return (
        <span className="bg-[#5C4033] text-[#FDFBF7] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          Preparing
        </span>
      );
    }
    if (order.order_status === 'ready') {
      return (
        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          Ready for Claim
        </span>
      );
    }
    if (order.order_status === 'completed') {
      return (
        <span className="bg-[#EFE8E1] text-[#736357] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          Completed
        </span>
      );
    }
    if (order.order_status === 'cancelled') {
      return (
        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
          Cancelled
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      <Header
        title="Staff Display System"
        showLowStockBadge={false}
      />

      {/* Staff Secondary Action Bar */}
      <div className="bg-[#F4EFEB]/80 border-b border-[#E6DDD4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5 w-full">
            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order #, customer..."
                className="w-full min-h-[38px] pl-8 pr-3 py-1.5 bg-white border border-[#E6DDD4] rounded-xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]"
              />
              <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-2.5 top-2.5" />
            </div>

            {/* Sound + Logout, pushed right */}
            <div className="flex items-center gap-2.5 ml-auto">
              {/* Sound Chime Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
                  soundEnabled
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-[#E6DDD4] text-stone-500 hover:bg-stone-100'
                }`}
                title={soundEnabled ? 'Chime sound active' : 'Chime sound muted'}
                aria-label="Toggle chime sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
              </button>

              {/* Staff Logout Button */}
              <button
                type="button"
                onClick={() => logoutUnified()}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Logout Staff Session"
                aria-label="Logout Staff"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation: Active Queue as the default "home" state, filter tabs alongside */}
        <div className="flex items-center gap-3 overflow-x-auto pb-3 border-b border-[#EFE8E1]">
          {/* Active Queue: default landing view, visually distinct from the filter chips */}
          <button
            onClick={() => setActiveTab('active')}
            className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer border-2 ${
              activeTab === 'active'
                ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033] shadow-sm'
                : 'bg-white text-[#5C4033] border-[#5C4033]/30 hover:border-[#5C4033]'
            }`}
            title="Default view: pending, preparing, and ready orders"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Active Queue</span>
            {unverifiedPaymentCount > 0 && (
              <span
                title={`${unverifiedPaymentCount} unverified payment order(s)`}
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'active'
                    ? 'bg-amber-400 text-stone-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {unverifiedPaymentCount}
              </span>
            )}
          </button>

          {/* Divider between the default view and the filter chips */}
          <div className="w-px h-6 bg-[#EFE8E1] shrink-0" />

          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            {[
              { id: 'preparing', label: 'Preparing' },
              { id: 'ready', label: 'Ready for Claim' },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All Orders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[38px] px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#5C4033] text-[#FDFBF7] shadow-xs'
                    : 'bg-[#F4EFEB] text-[#736357] hover:bg-[#E6DDD4]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Card Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPendingVerification = order.order_status === 'pending';
            const isGCash = order.payment_method === 'online';
            const isCash = order.payment_method === 'cash';
            const hasCancelRequest = order.cancellation_requested;

            return (
              <div
                key={order.id}
                className={`bg-[#FDFBF7] border-2 rounded-3xl p-5 shadow-xs flex flex-col justify-between transition ${
                  hasCancelRequest
                    ? 'border-amber-400 bg-amber-50/20'
                    : isPendingVerification
                    ? 'border-amber-300 shadow-sm ring-2 ring-amber-100'
                    : order.order_status === 'ready'
                    ? 'border-emerald-300 bg-emerald-50/15'
                    : 'border-[#EFE8E1]'
                }`}
              >
                <div>
                  {/* Top Bar: Token, Status, Timestamp */}
                  <div className="flex items-center justify-between border-b border-[#F4EFEB] pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-sm font-extrabold text-[#5C4033]">
                          #{order.order_number || order.tracking_token}
                        </span>
                        {getStatusBadge(order)}
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
                          📍 {order.delivery_details.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ready - Name Calling Notification for Barista */}
                  {order.order_status === 'ready' && (
                    <div className="mt-3 px-3 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="text-xs font-bold text-emerald-800">Order Ready!</span>
                    </div>
                  )}

                  {/* Customer Cancellation Request Banner */}
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
                              type="button"
                              onClick={() => handleCancellation(order.id, true)}
                              className="px-3 py-1 bg-[#DC2626] text-white text-[11px] font-bold rounded-full shadow-xs cursor-pointer"
                            >
                              Approve Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancellation(order.id, false)}
                              className="px-3 py-1 bg-white border border-amber-300 text-amber-900 text-[11px] font-bold rounded-full cursor-pointer"
                            >
                              Reject & Continue
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MANDATORY PAYMENT VERIFICATION WORKFLOW CARD SECTION */}
                  {isPendingVerification && (
                    <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          {isGCash ? (
                            <>
                              <Receipt className="w-3.5 h-3.5 text-amber-700" />
                              <span>GCash Payment Verification</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3.5 h-3.5 text-amber-700" />
                              <span>Cash Collection Verification</span>
                            </>
                          )}
                        </span>
                        <span className="font-extrabold text-xs text-[#5C4033]">
                          ₱{order.total_amount.toFixed(2)}
                        </span>
                      </div>

                      {/*{isGCash && (
                        <div>
                          <p className="text-[11px] text-stone-700 leading-snug">
                            Customer uploaded a proof of payment screenshot. Inspect the receipt before approving.
                          </p>
                          <button
                            type="button"
                            onClick={() => setInspectingOrder(order)}
                            className="mt-2 w-full py-2 px-3 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            <span>View Proof of Payment</span>
                            {order.gcash_receipt_path && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
                            )}
                          </button>
                        </div>
                      )}

                      {isCash && (
                        <p className="text-[11px] text-stone-700 leading-snug">
                          Confirm physical cash receipt at the counter or table before approving order for kitchen preparation.
                        </p>
                      )} */}

                      {/* Action Buttons: Verify & Accept Order / Reject Order */}
                      <div className="pt-2 border-t border-amber-200 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => rejectOrder(order.id, isGCash ? 'Invalid GCash receipt' : 'Cash not received')}
                          className="py-2 px-2.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 hover:border-rose-400 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                          title="Reject this order"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => verifyAndAcceptOrder(order.id)}
                          className="flex-1 py-2 px-3 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                          title="Verify payment and send to kitchen"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Accept Order</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verified & Paid Badge */}
                  {order.payment_status === 'paid' && (
                    <div className="mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified & Paid via {order.payment_method.toUpperCase()}</span>
                      </span>
                      <span className="font-bold text-emerald-900">₱{order.total_amount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Item Breakdown */}
                  <div className="mt-4 space-y-2">
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

                {/* Bottom Stage Actions for Verified Orders */}
                <div className="mt-5 pt-3 border-t border-[#F4EFEB] flex items-center justify-between gap-2">
                  {/* Customer view preview button */}
                  <button
                    type="button"
                    onClick={() => {
                      viewOrderTracker(order.tracking_token);
                      setViewMode('customer');
                    }}
                    className="p-2 text-[#8C7A6B] hover:text-[#5C4033] hover:bg-[#EFE8E1] rounded-full transition cursor-pointer"
                    title="View Customer Mobile Tracker"
                    aria-label="View customer tracker"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {order.order_status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-full shadow-xs transition text-center cursor-pointer"
                      >
                        Mark Ready for Claim
                      </button>
                    )}

                    {order.order_status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full py-2.5 px-3 bg-[#2B231F] hover:bg-black text-[#FDFBF7] text-xs font-bold rounded-full shadow-xs transition text-center cursor-pointer"
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
              Switch filter tabs or submit a test order from the Customer Mobile view.
            </p>
          </div>
        )}
      </main>

      {/* High-Resolution GCash Proof of Payment Review Modal */}
      <OrderVerificationModal
        isOpen={Boolean(inspectingOrder)}
        onClose={() => setInspectingOrder(null)}
        order={inspectingOrder}
        onConfirmPayment={(orderId) => {
          verifyAndAcceptOrder(orderId);
          setInspectingOrder(null);
        }}
        onRejectOrder={(orderId, reason) => {
          rejectOrder(orderId, reason);
          setInspectingOrder(null);
        }}
      />
    </div>
  );
};