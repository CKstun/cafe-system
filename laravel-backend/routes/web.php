<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\CustomerMenuCatalog;
use App\Livewire\CustomerCart;
use App\Livewire\CustomerOrderTracker;
use App\Livewire\StaffPosDashboard;
use App\Livewire\AdminAnalytics;
use App\Livewire\AdminStaffManagement;
use App\Livewire\AdminProductCatalog;
use App\Livewire\AdminInventoryLogs;

// Public & Customer Routes
Route::get('/', fn () => view('customer.splash'))->name('home');
Route::get('/scan/{qr_token}', [App\Http\Controllers\QrRedirectController::class, 'handle'])->name('qr.scan');

Route::prefix('order')->group(function () {
    Route::get('/menu', CustomerMenuCatalog::class)->name('customer.menu');
    Route::get('/cart', CustomerCart::class)->name('customer.cart');
    Route::get('/tracker/{token}', CustomerOrderTracker::class)->name('customer.tracker');
});

// Barista Staff KDS (Protected by role:staff|admin)
Route::middleware(['auth', 'role:staff|admin'])->prefix('staff')->group(function () {
    Route::get('/kds', StaffPosDashboard::class)->name('staff.kds');
});

// Executive Admin Dashboards (Protected by role:admin)
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/analytics', AdminAnalytics::class)->name('admin.analytics');
    Route::get('/staff', AdminStaffManagement::class)->name('admin.staff');
    Route::get('/products', AdminProductCatalog::class)->name('admin.products');
    Route::get('/inventory', AdminInventoryLogs::class)->name('admin.inventory');
});