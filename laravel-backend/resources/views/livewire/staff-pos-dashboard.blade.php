<div class="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16"
     x-data="{
        playDing() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } catch(e) { console.warn('AudioContext notice:', e); }
        }
     }"
     @play-order-chime.window="playDing()">

    <!-- Real-Time Echo Toast Alert -->
    @if ($latestEchoBroadcast)
        <div x-data="{ show: true }"
             x-show="show"
             x-init="setTimeout(() => show = false, 8000)"
             class="fixed top-20 right-6 z-50 bg-[#2B231F] text-[#FDFBF7] border border-[#3E332D] rounded-2xl p-4 shadow-2xl max-w-sm">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="font-bold text-xs text-[#FAEDCD]">New Order Broadcast!</span>
                </div>
                <button @click="show = false" class="text-[#8C7A6B] hover:text-white">&times;</button>
            </div>
            <div class="mt-2 text-xs">
                <div class="font-mono font-bold text-base text-white">#{{ $latestEchoBroadcast['tracking_token'] }}</div>
                <p class="text-[#D4C5B9] mt-0.5">{{ $latestEchoBroadcast['customer_name'] }} • ₱{{ number_format($latestEchoBroadcast['total_amount'], 2) }}</p>
            </div>
        </div>
    @endif

    <!-- Orders Grid with live updates -->
    <div class="max-w-7xl mx-auto px-6 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @foreach ($orders as $order)
                <div class="bg-white border rounded-3xl p-5 shadow-xs">
                    <div class="flex justify-between items-center border-b pb-2">
                        <span class="font-mono font-bold text-[#5C4033]">#{{ $order->tracking_token }}</span>
                        <span class="text-xs uppercase px-2 py-0.5 rounded-full bg-[#EFE8E1]">{{ $order->order_status }}</span>
                    </div>
                    <p class="font-bold text-xs mt-2">{{ $order->customer_name }}</p>
                </div>
            @endforeach
        </div>
    </div>
</div>