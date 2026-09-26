<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Order extends Model
{
    protected $fillable = [
        'table_id',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'tracking_token',
        'customer_name',
        'order_type',
        'cancellation_requested',
        'cancellation_reason',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'cancellation_requested' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->tracking_token)) {
                $order->tracking_token = (string) rand(100000, 999999);
            }
        });
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(CafeTable::class, 'table_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Mark order as paid and atomically deduct inventory with lockForUpdate()
     */
    public function markAsPaid(?int $staffUserId = null): void
    {
        DB::transaction(function () use ($staffUserId) {
            // Lock the order record
            $lockedOrder = Order::where('id', $this->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->payment_status === 'paid') {
                return; // Already processed
            }

            $lockedOrder->update([
                'payment_status' => 'paid',
                'order_status' => $lockedOrder->order_status === 'pending' ? 'preparing' : $lockedOrder->order_status,
            ]);

            // Deduct stock for each item using lockForUpdate()
            foreach ($lockedOrder->items as $item) {
                if ($item->menu_item_id) {
                    $menuItem = MenuItem::where('id', $item->menu_item_id)->lockForUpdate()->first();
                    if ($menuItem && $menuItem->track_inventory) {
                        $menuItem->decrement('stock_quantity', $item->quantity);

                        InventoryLog::create([
                            'user_id' => $staffUserId,
                            'menu_item_id' => $menuItem->id,
                            'add_on_id' => null,
                            'change_type' => 'sale',
                            'quantity_changed' => -$item->quantity,
                            'notes' => "Order #{$lockedOrder->tracking_token} deduction",
                        ]);
                    }
                }

                // Check add-ons in customizations
                $customizations = $item->customizations ?? [];
                if (!empty($customizations['add_ons'])) {
                    foreach ($customizations['add_ons'] as $addOnData) {
                        $addOn = AddOn::where('id', $addOnData['id'])->lockForUpdate()->first();
                        if ($addOn && $addOn->track_inventory) {
                            $addOn->decrement('stock_quantity', $item->quantity);

                            InventoryLog::create([
                                'user_id' => $staffUserId,
                                'menu_item_id' => null,
                                'add_on_id' => $addOn->id,
                                'change_type' => 'sale',
                                'quantity_changed' => -$item->quantity,
                                'notes' => "Order #{$lockedOrder->tracking_token} add-on: {$addOn->name}",
                            ]);
                        }
                    }
                }
            }
        });
    }
}