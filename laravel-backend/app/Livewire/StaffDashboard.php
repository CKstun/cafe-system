<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class StaffDashboard extends Component
{
    public string $statusFilter = 'active'; // 'active', 'all', 'pending', 'preparing', 'ready', 'completed'

    public function approveCashPayment(int $orderId)
    {
        $order = Order::findOrFail($orderId);
        $order->markAsPaid(Auth::id());
        session()->flash('success', "Order #{$order->tracking_token} payment confirmed and marked preparing.");
    }

    public function updateOrderStatus(int $orderId, string $status)
    {
        $order = Order::findOrFail($orderId);
        $order->update(['order_status' => $status]);
        session()->flash('success', "Order #{$order->tracking_token} moved to {$status}.");
    }

    public function handleCancellation(int $orderId, bool $approve)
    {
        $order = Order::findOrFail($orderId);
        if ($approve) {
            $order->update([
                'order_status' => 'cancelled',
                'cancellation_requested' => false,
            ]);
            session()->flash('success', "Order #{$order->tracking_token} cancelled.");
        } else {
            $order->update(['cancellation_requested' => false]);
            session()->flash('info', "Cancellation rejected. Proceed with order.");
        }
    }

    public function render()
    {
        $query = Order::with(['items.menuItem', 'table'])->latest();

        if ($this->statusFilter === 'active') {
            $query->whereIn('order_status', ['pending', 'preparing', 'ready']);
        } elseif ($this->statusFilter !== 'all') {
            $query->where('order_status', $this->statusFilter);
        }

        return view('livewire.staff-dashboard', [
            'orders' => $query->get(),
        ])->layout('layouts.staff');
    }
}