<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\MenuItem;
use App\Models\AddOn;
use App\Models\CafeTable;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class CustomerOrdering extends Component
{
    // Navigation Screen State: 1 = Splash, 2 = Onboarding, 3 = Catalog, 6 = Cart, 7 = Payment
    public int $currentScreen = 1;

    // Customer Session Details
    public string $customerName = '';
    public string $orderType = 'dine-in'; // 'dine-in' or 'take-out'
    public ?int $selectedTableId = null;

    // Menu Filtering
    public string $selectedCategory = 'All';
    public string $searchQuery = '';

    // Customization Modal State (Screens 4 & 5)
    public bool $showItemModal = false;
    public ?MenuItem $selectedItem = null;
    public string $customSize = '16oz';
    public ?string $customFlavor = null;
    public string $customMilk = 'regular';
    public array $selectedAddOnIds = [];
    public string $customComments = '';
    public int $modalQuantity = 1;

    // Cart Lines
    public array $cart = []; // [['id', 'item_id', 'name', 'price', 'quantity', 'customizations']]

    // Payment State (Screen 7)
    public string $paymentMethod = 'cash'; // 'cash' or 'online'
    public string $onlineRefNumber = '';

    protected $rules = [
        'customerName' => 'required|min:2|max:50',
        'orderType' => 'required|in:dine-in,take-out',
    ];

    public function mount(?string $table = null)
    {
        if ($table) {
            $matchedTable = CafeTable::where('qr_token', $table)
                ->orWhere('table_number', $table)
                ->first();
            if ($matchedTable) {
                $this->selectedTableId = $matchedTable->id;
                $this->orderType = 'dine-in';
            }
        }
    }

    public function startOrdering()
    {
        $this->currentScreen = 2; // Move to Welcome Onboard form
    }

    public function submitCustomerInfo()
    {
        $this->validate([
            'customerName' => 'required|min:2|string',
            'orderType' => 'required|in:dine-in,take-out',
            'selectedTableId' => 'required_if:orderType,dine-in',
        ], [
            'customerName.required' => 'Please enter your name to proceed.',
            'selectedTableId.required_if' => 'Please select a table number for dine-in.',
        ]);

        $this->currentScreen = 3; // Move to Catalog
    }

    public function openItemModal(int $itemId)
    {
        $this->selectedItem = MenuItem::findOrFail($itemId);
        $this->customSize = $this->selectedItem->size ?: '16oz';
        $this->customFlavor = $this->selectedItem->flavor;
        $this->customMilk = $this->selectedItem->milk_type ?: 'regular';
        $this->selectedAddOnIds = [];
        $this->customComments = '';
        $this->modalQuantity = 1;
        $this->showItemModal = true;
    }

    public function toggleAddOn(int $addOnId)
    {
        if (in_array($addOnId, $this->selectedAddOnIds)) {
            $this->selectedAddOnIds = array_diff($this->selectedAddOnIds, [$addOnId]);
        } else {
            $this->selectedAddOnIds[] = $addOnId;
        }
    }

    public function incrementModalQty()
    {
        $this->modalQuantity++;
    }

    public function decrementModalQty()
    {
        if ($this->modalQuantity > 1) {
            $this->modalQuantity--;
        }
    }

    public function getItemModalPriceProperty(): float
    {
        if (!$this->selectedItem) return 0.00;

        $base = (float) $this->selectedItem->price;
        if ($this->customSize === '22oz') $base += 20;

        $addOnsTotal = AddOn::whereIn('id', $this->selectedAddOnIds)->sum('price');
        return ($base + $addOnsTotal) * $this->modalQuantity;
    }

    public function addItemToCart()
    {
        if (!$this->selectedItem) return;

        $chosenAddOns = AddOn::whereIn('id', $this->selectedAddOnIds)->get();
        $singleItemBase = (float) $this->selectedItem->price + ($this->customSize === '22oz' ? 20 : 0);
        $addOnsPrice = $chosenAddOns->sum('price');
        $unitPrice = $singleItemBase + $addOnsPrice;

        $cartId = uniqid('cart_');

        $this->cart[] = [
            'cart_id' => $cartId,
            'item_id' => $this->selectedItem->id,
            'name' => $this->selectedItem->name,
            'price' => $unitPrice,
            'quantity' => $this->modalQuantity,
            'image_path' => $this->selectedItem->image_path,
            'customizations' => [
                'size' => $this->customSize,
                'flavor' => $this->customFlavor,
                'milk_type' => $this->customMilk,
                'add_ons' => $chosenAddOns->map(fn($a) => ['id' => $a->id, 'name' => $a->name, 'price' => $a->price])->toArray(),
                'comments' => $this->customComments,
            ],
        ];

        $this->showItemModal = false;
    }

    public function updateCartQuantity(string $cartId, int $delta)
    {
        foreach ($this->cart as $index => $item) {
            if ($item['cart_id'] === $cartId) {
                $newQty = $item['quantity'] + $delta;
                if ($newQty <= 0) {
                    unset($this->cart[$index]);
                    $this->cart = array_values($this->cart);
                } else {
                    $this->cart[$index]['quantity'] = $newQty;
                }
                break;
            }
        }
    }

    public function removeCartItem(string $cartId)
    {
        $this->cart = array_values(array_filter($this->cart, fn($i) => $i['cart_id'] !== $cartId));
    }

    public function getSubtotalProperty(): float
    {
        return array_reduce($this->cart, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
    }

    public function proceedToPayment()
    {
        if (empty($this->cart)) return;
        $this->currentScreen = 7;
    }

    public function submitOrder()
    {
        if (empty($this->cart)) return;

        $createdOrder = DB::transaction(function () {
            $order = Order::create([
                'table_id' => $this->orderType === 'dine-in' ? $this->selectedTableId : null,
                'customer_name' => $this->customerName,
                'order_type' => $this->orderType,
                'total_amount' => $this->subtotal,
                'payment_method' => $this->paymentMethod,
                'payment_status' => $this->paymentMethod === 'online' ? 'paid' : 'unpaid',
                'order_status' => 'pending',
            ]);

            foreach ($this->cart as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $line['item_id'],
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                    'customizations' => $line['customizations'],
                ]);
            }

            // If online GCash was paid immediately, deduct stock
            if ($order->payment_status === 'paid') {
                $order->markAsPaid();
            }

            return $order;
        });

        // Redirect to live order tracking screen
        return redirect()->route('order.tracker', ['token' => $createdOrder->tracking_token]);
    }

    public function render()
    {
        $categories = MenuItem::select('category')->distinct()->pluck('category');

        $menuQuery = MenuItem::where('is_available', true);

        if ($this->selectedCategory !== 'All') {
            $menuQuery->where('category', $this->selectedCategory);
        }

        if (!empty($this->searchQuery)) {
            $menuQuery->where(function ($q) {
                $q->where('name', 'like', "%{$this->searchQuery}%")
                  ->orWhere('description', 'like', "%{$this->searchQuery}%");
            });
        }

        return view('livewire.customer-ordering', [
            'categories' => $categories,
            'menuItems' => $menuQuery->get(),
            'addOnsList' => AddOn::where('stock_quantity', '>', 0)->get(),
            'tables' => CafeTable::all(),
        ])->layout('layouts.app');
    }
}