<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDeliveryOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\AddOn;
use App\Events\OrderPlaced;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OrderApiController extends Controller
{
    /**
     * Store a newly placed order via REST API / multipart form-data.
     */
    public function store(StoreDeliveryOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($request, $validated) {
            $receiptPath = null;

            // 1. Process uploaded GCash Proof of Payment image if present
            if ($request->hasFile('gcash_receipt') && $request->file('gcash_receipt')->isValid()) {
                // Stores in storage/app/public/receipts
                $storedFile = $request->file('gcash_receipt')->store('receipts', 'public');
                $receiptPath = Storage::url($storedFile);
            }

            // 2. Calculate verified total amount & verify stock
            $totalAmount = 0.00;
            $itemsToCreate = [];

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::where('id', $itemData['item_id'])->lockForUpdate()->firstOrFail();
                
                $unitPrice = (float) $menuItem->price;
                $customizations = $itemData['customizations'] ?? [];

                if (!empty($customizations['size']) && $customizations['size'] === '22oz') {
                    $unitPrice += 20.00;
                }

                if (!empty($customizations['add_ons'])) {
                    $addOnIds = collect($customizations['add_ons'])->pluck('id')->filter();
                    if ($addOnIds->isNotEmpty()) {
                        $unitPrice += (float) AddOn::whereIn('id', $addOnIds)->sum('price');
                    }
                }

                $totalAmount += $unitPrice * $itemData['quantity'];
                $itemsToCreate[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'price' => $unitPrice,
                    'customizations' => $customizations,
                ];
            }

            // 3. Create Order Record with delivery details & receipt
            // Mandatory Verification Workflow: all orders begin in Pending Verification
            $order = Order::create([
                'tracking_token' => strtoupper(Str::random(8)),
                'customer_name' => $validated['customer_name'],
                'order_type' => 'take-out', // Delivery/take-out
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'order_status' => 'pending', // Starts in pending verification until Staff approves
                'contact_number' => $validated['contact_number'],
                'delivery_address' => "{$validated['delivery_address']}, {$validated['city_region']} {$validated['postal_code']}",
                'driver_notes' => $validated['driver_notes'] ?? null,
                'gcash_receipt_path' => $receiptPath,
            ]);

            // 4. Create Order Items
            foreach ($itemsToCreate as $itemSpec) {
                $order->items()->create($itemSpec);
            }

            return $order;
        });

        // 5. Broadcast Real-Time Order Event to Kitchen Display System (KDS)
        broadcast(new OrderPlaced($order->fresh(['items.menuItem'])))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully and transmitted to kitchen for payment verification.',
            'order' => [
                'id' => $order->id,
                'tracking_token' => $order->tracking_token,
                'status' => $order->order_status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'gcash_receipt_path' => $order->gcash_receipt_path,
                'total_amount' => $order->total_amount,
            ],
        ], 201);
    }
}
