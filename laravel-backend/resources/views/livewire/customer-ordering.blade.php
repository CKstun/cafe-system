{{-- resources/views/livewire/customer-ordering.blade.php --}}
<div class="min-h-screen bg-[#FDFBF7] text-[#2B231F] font-sans antialiased max-w-md mx-auto relative pb-24 shadow-2xl border-x border-[#EFE8E1]">

    {{-- SCREEN 1: SPLASH VIEW --}}
    @if($currentScreen === 1)
        <div class="flex flex-col items-center justify-between min-h-screen px-6 py-12 text-center">
            <div class="my-auto space-y-6">
                {{-- Cafe Pepita Logo Badge --}}
                <div class="w-28 h-28 mx-auto rounded-full bg-[#5C4033] flex items-center justify-center shadow-lg ring-4 ring-[#EFE8E1]">
                    <svg class="w-14 h-14 text-[#FDFBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                    </svg>
                </div>
                <div>
                    <h1 class="font-display text-4xl font-bold tracking-tight text-[#2B231F]">Café Pepita</h1>
                    <p class="mt-2 text-sm uppercase tracking-widest text-[#8C7A6B] font-semibold">Sip The Moment</p>
                </div>
                <p class="text-xs text-[#736357] max-w-xs mx-auto">
                    Artisanal coffee, handcrafted refreshers, and hearty comforting kitchen favorites.
                </p>
            </div>

            <div class="w-full space-y-3">
                <button wire:click="startOrdering" class="w-full py-4 px-6 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] font-semibold rounded-full shadow-md transition transform active:scale-95 text-base flex items-center justify-center gap-2">
                    <span>Start Ordering</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </div>
        </div>

    {{-- SCREEN 2: ONBOARDING / NAME & TABLE SELECTION --}}
    @elseif($currentScreen === 2)
        <div class="min-h-screen p-6 flex flex-col justify-between">
            <div>
                <button wire:click="$set('currentScreen', 1)" class="text-[#8C7A6B] hover:text-[#5C4033] text-sm flex items-center gap-1 mb-6">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    <span>Back</span>
                </button>
                <h2 class="font-display text-2xl font-bold text-[#2B231F]">Welcome Onboard</h2>
                <p class="text-sm text-[#8C7A6B] mt-1">Please provide your details so we can personalize your cafe experience.</p>

                <div class="mt-8 space-y-6">
                    {{-- Customer Name --}}
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Your Name</label>
                        <input type="text" wire:model.defer="customerName" placeholder="e.g. Cheska Kimberly" 
                               class="w-full px-4 py-3.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-2xl text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                        @error('customerName') <p class="mt-1.5 text-xs text-[#DC2626] font-medium">{{ $message }}</p> @enderror
                    </div>

                    {{-- Order Type Pill Toggle --}}
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Dining Preference</label>
                        <div class="grid grid-cols-2 gap-3 p-1.5 bg-[#EFE8E1] rounded-full">
                            <button type="button" wire:click="$set('orderType', 'dine-in')"
                                    class="py-2.5 rounded-full text-sm font-semibold transition {{ $orderType === 'dine-in' ? 'bg-[#5C4033] text-[#FDFBF7] shadow' : 'text-[#736357]' }}">
                                Dine-in
                            </button>
                            <button type="button" wire:click="$set('orderType', 'take-out')"
                                    class="py-2.5 rounded-full text-sm font-semibold transition {{ $orderType === 'take-out' ? 'bg-[#5C4033] text-[#FDFBF7] shadow' : 'text-[#736357]' }}">
                                Take-out
                            </button>
                        </div>
                    </div>

                    {{-- Table Number Selection (If Dine-in) --}}
                    @if($orderType === 'dine-in')
                        <div class="p-4 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4]">
                            <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Select Your Table</label>
                            <div class="grid grid-cols-5 gap-2">
                                @foreach($tables as $tbl)
                                    <button type="button" wire:click="$set('selectedTableId', {{ $tbl->id }})"
                                            class="py-2.5 rounded-xl text-xs font-bold transition border {{ $selectedTableId == $tbl->id ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#FDFBF7] text-[#5C4033] border-[#E6DDD4]' }}">
                                        T-{{ $tbl->table_number }}
                                    </button>
                                @endforeach
                            </div>
                            @error('selectedTableId') <p class="mt-2 text-xs text-[#DC2626] font-medium">{{ $message }}</p> @enderror
                        </div>
                    @endif
                </div>
            </div>

            <button wire:click="submitCustomerInfo" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-semibold rounded-full shadow-md mt-8">
                Explore Menu
            </button>
        </div>

    {{-- SCREEN 3: MENU CATALOG --}}
    @elseif($currentScreen === 3)
        <div>
            {{-- App Header with Customer Greeting --}}
            <header class="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EFE8E1] px-5 py-3.5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-[#8C7A6B]">Welcome,</p>
                        <h2 class="text-base font-bold text-[#2B231F] flex items-center gap-1.5">
                            <span>{{ $customerName }}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE8E1] text-[#5C4033] uppercase font-semibold">
                                {{ $orderType === 'dine-in' ? "Table $selectedTableId" : 'Take-out' }}
                            </span>
                        </h2>
                    </div>

                    {{-- Cart Icon Button --}}
                    <button wire:click="$set('currentScreen', 6)" class="relative p-2.5 rounded-full bg-[#EFE8E1] text-[#5C4033]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        @if(count($cart) > 0)
                            <span class="absolute -top-1 -right-1 w-5 h-5 bg-[#5C4033] text-[#FDFBF7] text-[10px] font-bold rounded-full flex items-center justify-center">
                                {{ array_sum(array_column($cart, 'quantity')) }}
                            </span>
                        @endif
                    </button>
                </div>

                {{-- Search Bar --}}
                <div class="mt-3 relative">
                    <input type="text" wire:model.live.debounce.300ms="searchQuery" placeholder="Search drinks, rice bowls, snacks..."
                           class="w-full pl-10 pr-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-full text-xs text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                    <svg class="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>

                {{-- Horizontal Category Pills --}}
                <div class="flex gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
                    <button wire:click="$set('selectedCategory', 'All')"
                            class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition {{ $selectedCategory === 'All' ? 'bg-[#5C4033] text-[#FDFBF7]' : 'bg-[#EFE8E1] text-[#736357]' }}">
                        All
                    </button>
                    @foreach($categories as $cat)
                        <button wire:click="$set('selectedCategory', '{{ $cat }}')"
                                class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition {{ $selectedCategory === $cat ? 'bg-[#5C4033] text-[#FDFBF7]' : 'bg-[#EFE8E1] text-[#736357]' }}">
                            {{ $cat }}
                        </button>
                    @endforeach
                </div>
            </header>

            {{-- Menu Grid --}}
            <div class="p-5 grid grid-cols-2 gap-3.5">
                @forelse($menuItems as $item)
                    <div class="bg-[#FDFBF7] border border-[#EFE8E1] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-2.5 group hover:border-[#D9CDC1] transition">
                        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EFE8E1]">
                            <img src="{{ $item->image_path }}" alt="{{ $item->name }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                            @if($item->size)
                                <span class="absolute top-2 left-2 bg-[#FDFBF7]/90 backdrop-blur-sm text-[#5C4033] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {{ $item->size }}
                                </span>
                            @endif
                        </div>

                        <div class="mt-2.5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 class="font-bold text-xs text-[#2B231F] line-clamp-1">{{ $item->name }}</h3>
                                <p class="text-[10px] text-[#8C7A6B] line-clamp-2 mt-0.5">{{ $item->description }}</p>
                            </div>

                            <div class="mt-3 flex items-center justify-between pt-2 border-t border-[#F4EFEB]">
                                <span class="font-bold text-xs text-[#5C4033]">₱{{ number_format($item->price, 2) }}</span>
                                <button wire:click="openItemModal({{ $item->id }})" class="w-7 h-7 rounded-full bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow hover:bg-[#4A3328] active:scale-90 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-span-2 py-12 text-center text-xs text-[#8C7A6B]">
                        No items found matching your criteria.
                    </div>
                @endforelse
            </div>

            {{-- Floating Cart Bottom Bar --}}
            @if(count($cart) > 0)
                <div class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
                    <button wire:click="$set('currentScreen', 6)" class="w-full py-3.5 px-5 bg-[#5C4033] text-[#FDFBF7] rounded-full shadow-xl flex items-center justify-between font-bold text-xs tracking-wide">
                        <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] flex items-center justify-center text-[10px]">
                                {{ array_sum(array_column($cart, 'quantity')) }}
                            </span>
                            <span>View Cart</span>
                        </div>
                        <span>₱{{ number_format($this->subtotal, 2) }}</span>
                    </button>
                </div>
            @endif
        </div>

    {{-- SCREENS 4 & 5: ITEM CUSTOMIZATION MODAL --}}
    @if($showItemModal && $selectedItem)
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <div class="bg-[#FDFBF7] w-full max-w-md rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-display text-lg font-bold text-[#2B231F]">{{ $selectedItem->name }}</h3>
                        <p class="text-xs text-[#8C7A6B] mt-0.5">Customize your drink to your exact liking</p>
                    </div>
                    <button wire:click="$set('showItemModal', false)" class="w-8 h-8 rounded-full bg-[#EFE8E1] text-[#736357] flex items-center justify-center">
                        ✕
                    </button>
                </div>

                {{-- Size Selectors --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-2">Cup Size</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" wire:click="$set('customSize', '16oz')"
                                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-between {{ $customSize === '16oz' ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                            <span>16oz (Regular)</span>
                            <span>₱{{ number_format($selectedItem->price, 2) }}</span>
                        </button>
                        <button type="button" wire:click="$set('customSize', '22oz')"
                                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-between {{ $customSize === '22oz' ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                            <span>22oz (Large)</span>
                            <span>+₱20.00</span>
                        </button>
                    </div>
                </div>

                {{-- Add-Ons Selection --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-2">Add-Ons & Extras</label>
                    <div class="grid grid-cols-2 gap-2">
                        @foreach($addOnsList as $addon)
                            <button type="button" wire:click="toggleAddOn({{ $addon->id }})"
                                    class="p-2.5 rounded-xl border text-left text-xs transition {{ in_array($addon->id, $selectedAddOnIds) ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                                <p class="font-semibold">{{ $addon->name }}</p>
                                <p class="text-[10px] opacity-80">+₱{{ number_format($addon->price, 2) }}</p>
                            </button>
                        @endforeach
                    </div>
                </div>

                {{-- Comments / Notes --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-1.5">Special Instructions</label>
                    <input type="text" wire:model.defer="customComments" placeholder="e.g. Less sugar, extra ice, separate syrup"
                           class="w-full px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-2xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                </div>

                {{-- Quantity and Add Button Floating Footer --}}
                <div class="mt-6 pt-4 border-t border-[#EFE8E1] flex items-center gap-3">
                    <div class="flex items-center bg-[#EFE8E1] rounded-full p-1">
                        <button wire:click="decrementModalQty" class="w-8 h-8 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold flex items-center justify-center">-</button>
                        <span class="w-8 text-center text-xs font-bold">{{ $modalQuantity }}</span>
                        <button wire:click="incrementModalQty" class="w-8 h-8 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold flex items-center justify-center">+</button>
                    </div>

                    <button wire:click="addItemToCart" class="flex-1 py-3.5 bg-[#5C4033] text-[#FDFBF7] font-bold text-xs rounded-full shadow hover:bg-[#4A3328] transition flex items-center justify-between px-5">
                        <span>Add Item</span>
                        <span>₱{{ number_format($this->itemModalPrice, 2) }}</span>
                    </button>
                </div>
            </div>
        </div>
    @endif

    {{-- SCREEN 6: YOUR CART VIEW --}}
    @elseif($currentScreen === 6)
        <div class="min-h-screen p-5 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-[#EFE8E1]">
                    <button wire:click="$set('currentScreen', 3)" class="text-[#8C7A6B] hover:text-[#5C4033] text-xs flex items-center gap-1 font-semibold">
                        ← Back to Menu
                    </button>
                    <h2 class="font-display text-lg font-bold text-[#2B231F]">Your Cart</h2>
                    <span class="text-xs text-[#8C7A6B]">{{ count($cart) }} items</span>
                </div>

                <div class="mt-4 space-y-3">
                    @forelse($cart as $line)
                        <div class="p-3.5 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] flex items-center justify-between gap-3">
                            <div class="flex-1">
                                <h4 class="font-bold text-xs text-[#2B231F]">{{ $line['name'] }}</h4>
                                <p class="text-[10px] text-[#8C7A6B]">
                                    Size: {{ $line['customizations']['size'] ?? 'Standard' }}
                                    @if(!empty($line['customizations']['add_ons']))
                                        • +{{ count($line['customizations']['add_ons']) }} add-ons
                                    @endif
                                </p>
                                <p class="font-bold text-xs text-[#5C4033] mt-1">₱{{ number_format($line['price'] * $line['quantity'], 2) }}</p>
                            </div>

                            <div class="flex items-center gap-2">
                                <div class="flex items-center bg-[#EFE8E1] rounded-full p-0.5">
                                    <button wire:click="updateCartQuantity('{{ $line['cart_id'] }}', -1)" class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center">-</button>
                                    <span class="w-6 text-center text-xs font-bold">{{ $line['quantity'] }}</span>
                                    <button wire:click="updateCartQuantity('{{ $line['cart_id'] }}', 1)" class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center">+</button>
                                </div>
                                <button wire:click="removeCartItem('{{ $line['cart_id'] }}')" class="p-2 text-[#DC2626] hover:bg-red-50 rounded-full">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    @empty
                        <div class="py-16 text-center text-xs text-[#8C7A6B]">
                            Your cart is empty. Add delicious items from the catalog!
                        </div>
                    @endforelse
                </div>
            </div>

            @if(count($cart) > 0)
                <div class="pt-4 border-t border-[#EFE8E1] space-y-3">
                    <div class="flex justify-between text-xs text-[#736357]">
                        <span>Subtotal</span>
                        <span>₱{{ number_format($this->subtotal, 2) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm text-[#2B231F]">
                        <span>Total Due</span>
                        <span class="text-[#5C4033]">₱{{ number_format($this->subtotal, 2) }}</span>
                    </div>
                    <button wire:click="proceedToPayment" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-bold rounded-full text-xs shadow-md hover:bg-[#4A3328] transition">
                        Proceed to Checkout
                    </button>
                </div>
            @endif
        </div>

    {{-- SCREEN 7: PAYMENT VIEW --}}
    @elseif($currentScreen === 7)
        <div class="min-h-screen p-5 flex flex-col justify-between">
            <div>
                <button wire:click="$set('currentScreen', 6)" class="text-[#8C7A6B] hover:text-[#5C4033] text-xs flex items-center gap-1 font-semibold mb-5">
                    ← Back to Cart
                </button>
                <h2 class="font-display text-xl font-bold text-[#2B231F]">Select Payment Option</h2>
                <p class="text-xs text-[#8C7A6B] mt-1">Order total: <strong class="text-[#5C4033]">₱{{ number_format($this->subtotal, 2) }}</strong></p>

                <div class="mt-6 space-y-4">
                    {{-- Cash Option (Green badge) --}}
                    <div wire:click="$set('paymentMethod', 'cash')"
                         class="p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 {{ $paymentMethod === 'cash' ? 'border-[#5C4033] bg-[#F4EFEB]' : 'border-[#E6DDD4] bg-[#FDFBF7]' }}">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 {{ $paymentMethod === 'cash' ? 'border-[#5C4033]' : 'border-[#A6978A]' }}">
                            @if($paymentMethod === 'cash') <div class="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div> @endif
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-xs text-[#2B231F]">Cash at Counter</h4>
                                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cash</span>
                            </div>
                            <p class="text-[11px] text-[#736357] mt-1">Pay with physical cash at the barista counter. Order is verified once payment is received.</p>
                        </div>
                    </div>

                    {{-- GCash / Online Option (Blue badge) --}}
                    <div wire:click="$set('paymentMethod', 'online')"
                         class="p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 {{ $paymentMethod === 'online' ? 'border-[#5C4033] bg-[#F4EFEB]' : 'border-[#E6DDD4] bg-[#FDFBF7]' }}">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 {{ $paymentMethod === 'online' ? 'border-[#5C4033]' : 'border-[#A6978A]' }}">
                            @if($paymentMethod === 'online') <div class="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div> @endif
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-xs text-[#2B231F]">GCash E-Wallet</h4>
                                <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">GCash</span>
                            </div>
                            <p class="text-[11px] text-[#736357] mt-1">Instant electronic payment via GCash QR code. Directly advances order to preparing.</p>

                            @if($paymentMethod === 'online')
                                <div class="mt-3 p-3 bg-[#FDFBF7] rounded-xl border border-[#E6DDD4] text-center">
                                    <p class="text-[11px] font-semibold text-[#5C4033]">Scan Merchant QR</p>
                                    <div class="w-28 h-28 bg-white mx-auto my-2 border rounded-lg flex items-center justify-center p-1">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GCASH-CAFEPITA-ORDER" alt="GCash QR" class="w-full h-full">
                                    </div>
                                    <input type="text" wire:model.defer="onlineRefNumber" placeholder="Enter GCash Ref No. (e.g. 10293847)"
                                           class="w-full px-3 py-2 text-[11px] bg-[#F4EFEB] border rounded-lg focus:outline-none">
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <button wire:click="submitOrder" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-bold rounded-full text-xs shadow-lg hover:bg-[#4A3328] transition">
                Confirm & Place Order
            </button>
        </div>
    @endif
</div>