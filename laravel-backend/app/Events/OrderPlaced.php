<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['items.menuItem', 'table']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('staff.orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderPlaced';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'tracking_token' => $this->order->tracking_token,
            'order_type' => $this->order->order_type,
            'table_number' => $this->order->table ? $this->order->table->table_number : null,
            'customer_name' => $this->order->customer_name,
            'payment_method' => $this->order->payment_method,
            'payment_status' => $this->order->payment_status,
            'order_status' => $this->order->order_status,
            'total_amount' => (float) $this->order->total_amount,
            'items_count' => $this->order->items->count(),
            'items' => $this->order->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->menuItem ? $item->menuItem->name : 'Item',
                'quantity' => $item->quantity,
                'size' => $item->size,
                'temperature' => $item->temperature,
                'sugar_level' => $item->sugar_level,
                'customizations' => $item->customizations,
            ]),
            'created_at' => $this->order->created_at->toIso8601String(),
        ];
    }
}