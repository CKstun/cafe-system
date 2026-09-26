<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboard extends Component
{
    public string $activeTab = 'analytics'; // 'analytics', 'staff', 'products', 'inventory'

    // Date Range Filters for Sales
    public string $dateFilter = 'today'; // 'today', 'week', 'month', 'custom'
    public ?string $customStartDate = null;
    public ?string $customEndDate = null;

    // Staff CRUD State
    public string $staffName = '';
    public string $staffEmail = '';
    public string $staffPassword = '';
    public ?int $editingStaffId = null;

    // Inventory Restock State
    public ?int $restockItemId = null;
    public int $restockQuantity = 50;
    public string $restockNotes = 'Manual batch restock';

    public function restockItem(int $itemId)
    {
        DB::transaction(function () use ($itemId) {
            $item = MenuItem::where('id', $itemId)->lockForUpdate()->firstOrFail();
            $item->increment('stock_quantity', $this->restockQuantity);

            InventoryLog::create([
                'user_id' => auth()->id(),
                'menu_item_id' => $item->id,
                'add_on_id' => null,
                'change_type' => 'restock',
                'quantity_changed' => $this->restockQuantity,
                'notes' => $this->restockNotes,
            ]);
        });

        session()->flash('success', 'Item stock updated and logged.');
    }

    public function saveStaff()
    {
        $this->validate([
            'staffName' => 'required|string|max:100',
            'staffEmail' => 'required|email|unique:users,email,' . $this->editingStaffId,
            'staffPassword' => $this->editingStaffId ? 'nullable|min:6' : 'required|min:6',
        ]);

        if ($this->editingStaffId) {
            $staff = User::findOrFail($this->editingStaffId);
            $staff->name = $this->staffName;
            $staff->email = $this->staffEmail;
            if ($this->staffPassword) {
                $staff->password = Hash::make($this->staffPassword);
            }
            $staff->save();
            session()->flash('success', 'Staff account updated.');
        } else {
            User::create([
                'name' => $this->staffName,
                'email' => $this->staffEmail,
                'password' => Hash::make($this->staffPassword),
                'role' => 'staff',
                'is_active' => true,
            ]);
            session()->flash('success', 'New staff member registered.');
        }

        $this->resetStaffForm();
    }

    public function resetStaffForm()
    {
        $this->staffName = '';
        $this->staffEmail = '';
        $this->staffPassword = '';
        $this->editingStaffId = null;
    }

    public function render()
    {
        // 1. Calculate Date Range
        $start = Carbon::today();
        $end = Carbon::now();

        if ($this->dateFilter === 'week') {
            $start = Carbon::now()->startOfWeek();
        } elseif ($this->dateFilter === 'month') {
            $start = Carbon::now()->startOfMonth();
        } elseif ($this->dateFilter === 'custom' && $this->customStartDate && $this->customEndDate) {
            $start = Carbon::parse($this->customStartDate)->startOfDay();
            $end = Carbon::parse($this->customEndDate)->endOfDay();
        }

        // 2. Aggregate Sales Reports
        $paidOrders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end]);

        $totalRevenue = (clone $paidOrders)->sum('total_amount');
        $totalOrders = (clone $paidOrders)->count();

        $totalUnitsSold = OrderItem::whereHas('order', function ($q) use ($start, $end) {
            $q->where('payment_status', 'paid')->whereBetween('created_at', [$start, $end]);
        })->sum('quantity');

        $bestSellers = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(quantity * price) as total_sales'))
            ->whereHas('order', function ($q) use ($start, $end) {
                $q->where('payment_status', 'paid')->whereBetween('created_at', [$start, $end]);
            })
            ->with('menuItem')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // 3. Low stock threshold detection (<= 15 items)
        $lowStockItems = MenuItem::where('track_inventory', true)
            ->where('stock_quantity', '<=', 15)
            ->get();

        return view('livewire.admin-dashboard', [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'totalUnitsSold' => $totalUnitsSold,
            'bestSellers' => $bestSellers,
            'lowStockItems' => $lowStockItems,
            'staffMembers' => User::where('role', 'staff')->get(),
            'menuItems' => MenuItem::all(),
            'inventoryLogs' => InventoryLog::with(['user', 'menuItem', 'addOn'])->latest('id')->take(20)->get(),
        ])->layout('layouts.admin');
    }
}