{{-- resources/views/livewire/order-tracker.blade.php --}}
<div wire:poll.3s="loadOrder" class="min-h-screen bg-[#FDFBF7] text-[#2B231F] font-sans antialiased max-w-md mx-auto p-5 pb-12 shadow-2xl border-x border-[#EFE8E1]">

    {{-- Order Placed Banner --}}
    <div class="text-center py-6 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-sm">
        <div class="w-14 h-14 mx-auto rounded-full bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="font-display text-2xl font-bold text-[#2B231F] mt-3">Order Placed!</h2>
        <p class="text-xs text-[#8C7A6B] mt-0.5">Tracking Token:</p>
        <p class="font-mono text-base font-extrabold text-[#5C4033] tracking-wider">{{ $order->tracking_token }}</p>
    </div>

    {{-- Customer & Order Specs --}}
    <div class="mt-4 p-4 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] flex justify-between text-xs">
        <div>
            <p class="text-[#8C7A6B]">Customer</p>
            <p class="font-bold text-[#2B231F]">{{ $order->customer_name }}</p>
        </div>
        <div>
            <p class="text-[#8C7A6B]">Order Type</p>
            <p class="font-bold text-[#2B231F] uppercase">{{ $order->order_type }} {{ $order->table ? "(T-{$order->table->table_number})" : '' }}</p>
        </div>
        <div>
            <p class="text-[#8C7A6B]">Payment</p>
            <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold {{ $order->payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' }}">
                {{ strtoupper($order->payment_status) }}
            </span>
        </div>
    </div>

    {{-- VERTICAL PROGRESS PIPELINE (Screen 8) --}}
    <div class="mt-6 p-5 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4]">
        <h3 class="text-xs uppercase tracking-wider font-bold text-[#5C4033] mb-4">Live Kitchen Status</h3>

        <div class="space-y-6 relative pl-6 border-l-2 border-[#D9CDC1] ml-3">
            {{-- Step 1: Order Placed --}}
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-[#5C4033] bg-[#5C4033] text-white flex items-center justify-center text-[10px]">
                    ✓
                </div>
                <div>
                    <h4 class="font-bold text-xs text-[#2B231F]">Order Placed</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Received by Café Pepita POS system.</p>
                </div>
            </div>

            {{-- Step 2: Preparing --}}
            @php
                $isPreparing = in_array($order->order_status, ['preparing', 'ready', 'completed']);
                $isActivePreparing = $order->order_status === 'preparing';
            @endphp
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 {{ $isPreparing ? 'border-[#5C4033] bg-[#5C4033] text-white' : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]' }} flex items-center justify-center text-[10px] {{ $isActivePreparing ? 'animate-pulse ring-4 ring-[#5C4033]/20' : '' }}">
                    2
                </div>
                <div>
                    <h4 class="font-bold text-xs {{ $isPreparing ? 'text-[#2B231F]' : 'text-[#8C7A6B]' }}">Preparing</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Baristas are brewing and assembling your order.</p>
                </div>
            </div>

            {{-- Step 3: Ready for Pickup --}}
            @php
                $isReady = in_array($order->order_status, ['ready', 'completed']);
            @endphp
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 {{ $isReady ? 'border-[#5C4033] bg-[#5C4033] text-white' : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]' }} flex items-center justify-center text-[10px]">
                    3
                </div>
                <div>
                    <h4 class="font-bold text-xs {{ $isReady ? 'text-[#2B231F]' : 'text-[#8C7A6B]' }}">Ready for Pickup</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Your order is ready at the claim counter!</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Order Summary Lines --}}
    <div class="mt-6 p-4 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] space-y-2">
        <h4 class="text-xs uppercase tracking-wider font-bold text-[#5C4033] mb-2">Order Items</h4>
        @foreach($order->items as $item)
            <div class="flex justify-between text-xs py-1 border-b border-[#F4EFEB] last:border-none">
                <div>
                    <span class="font-bold">{{ $item->quantity }}x</span> {{ $item->menuItem->name ?? 'Custom Item' }}
                </div>
                <span class="font-bold text-[#5C4033]">₱{{ number_format($item->price * $item->quantity, 2) }}</span>
            </div>
        @endforeach
        <div class="pt-2 flex justify-between font-bold text-xs text-[#2B231F]">
            <span>Total</span>
            <span class="text-[#5C4033]">₱{{ number_format($order->total_amount, 2) }}</span>
        </div>
    </div>

    {{-- Cancellation Action (Only allowed while status is 'pending') --}}
    <div class="mt-6">
        @if($order->order_status === 'pending')
            @if($order->cancellation_requested)
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs text-amber-800">
                    Cancellation request submitted. Awaiting staff confirmation.
                </div>
            @else
                <button wire:click="$set('showCancelModal', true)" class="w-full py-3 bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold text-xs rounded-full border border-red-200 transition">
                    Cancel Order
                </button>
            @endif
        @else
            <p class="text-center text-[11px] text-[#8C7A6B]">
                Order is currently in preparation and can no longer be modified.
            </p>
        @endif
    </div>

    {{-- Cancellation Modal --}}
    @if($showCancelModal)
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5">
            <div class="bg-[#FDFBF7] w-full max-w-sm rounded-3xl p-5 border border-[#EFE8E1] shadow-2xl">
                <h3 class="font-display text-base font-bold text-[#2B231F]">Cancel Order</h3>
                <p class="text-xs text-[#8C7A6B] mt-1">Are you sure you want to cancel order #{{ $order->tracking_token }}?</p>
                <textarea wire:model.defer="cancelReason" placeholder="Reason for cancellation..." 
                          class="w-full mt-3 p-3 bg-[#F4EFEB] border rounded-xl text-xs text-[#2B231F] focus:outline-none"></textarea>
                <div class="mt-4 flex gap-2">
                    <button wire:click="$set('showCancelModal', false)" class="flex-1 py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-full">Keep Order</button>
                    <button wire:click="requestCancellation" class="flex-1 py-2.5 bg-[#DC2626] text-white font-bold text-xs rounded-full">Confirm Cancel</button>
                </div>
            </div>
        </div>
    @endif
</div>