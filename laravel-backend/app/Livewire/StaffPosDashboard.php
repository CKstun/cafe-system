<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;
use App\Models\Order;
use App\Services\InventoryDeductionService;
use Illuminate\Support\Facades\DB;

class StaffPosDashboard extends Component
{
    public string $activeTab = 'active';
    public string $search = '';
    public ?array $latestEchoBroadcast = null;

    /**
     * Real-time listener for Laravel Echo broadcast on private-staff.orders channel.
     * Livewire v3 receives this event automatically via WebSocket.
     */
    #[On('echo-private:staff.orders,OrderPlaced')]
    public function onOrderPlaced($payload): void
    {
        $this->latestEchoBroadcast = $payload;
        $this->dispatch('play-order-chime');
        session()->flash('broadcast_alert', "New Ticket #{$payload['tracking_token']} from {$payload['customer_name']}!");
    }

    public function updateStatus(int $orderId, string $newStatus): void
    {
        $order = Order::findOrFail($orderId);
        $order->update(['order_status' => $newStatus]);
        if ($newStatus === 'completed') {
            $order->update(['completed_at' => now()]);
        }
    }

    public function approveCash(int $orderId, InventoryDeductionService $inventoryService): void
    {
        DB::transaction(function () use ($orderId, $inventoryService) {
            $order = Order::where('id', $orderId)->lockForUpdate()->firstOrFail();
            if ($order->payment_status === 'paid') return;

            $inventoryService->deductAtomicStockForOrder($order);
            $order->update(['payment_status' => 'paid', 'order_status' => 'preparing']);
        });
    }

    public function render()
    {
        $ordersQuery = Order::with(['items.menuItem', 'table'])->latest();

        if ($this->activeTab === 'active') {
            $ordersQuery->whereIn('order_status', ['pending', 'preparing', 'ready']);
        } elseif ($this->activeTab !== 'all') {
            $ordersQuery->where('order_status', $this->activeTab);
        }

        if (!empty($this->search)) {
            $ordersQuery->where(function ($q) {
                $q->where('tracking_token', 'like', "%{$this->search}%")
                  ->orWhere('customer_name', 'like', "%{$this->search}%");
            });
        }

        return view('livewire.staff-pos-dashboard', [
            'orders' => $ordersQuery->get(),
        ]);
    }
}