<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Order;

class OrderTracker extends Component
{
    public string $trackingToken;
    public ?Order $order = null;
    public string $cancelReason = '';
    public bool $showCancelModal = false;

    public function mount(string $token)
    {
        $this->trackingToken = $token;
        $this->loadOrder();
    }

    /**
     * Polled every 3 seconds via wire:poll.3s
     */
    public function loadOrder()
    {
        $this->order = Order::with(['items.menuItem', 'table'])
            ->where('tracking_token', $this->trackingToken)
            ->firstOrFail();
    }

    public function requestCancellation()
    {
        if ($this->order->order_status !== 'pending') {
            session()->flash('error', 'Orders cannot be cancelled once the kitchen has started preparing.');
            return;
        }

        $this->order->update([
            'cancellation_requested' => true,
            'cancellation_reason' => $this->cancelReason ?: 'Customer requested cancellation via mobile app.',
        ]);

        $this->showCancelModal = false;
        session()->flash('message', 'Cancellation request submitted to staff.');
    }

    public function render()
    {
        return view('livewire.order-tracker')->layout('layouts.app');
    }
}