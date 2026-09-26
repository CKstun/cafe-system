<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminSalesReportController extends Controller
{
    /**
     * Export date-filtered sales report as CSV
     * Route: GET /api/admin/reports/export?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function export(Request $request): StreamedResponse
    {
        // 1. Authorize Admin permission via Sanctum token
        if (!$request->user() || !$request->user()->tokenCan('role:admin')) {
            abort(403, 'Unauthorized. Admin ability required.');
        }

        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? now()->subDays(7)->toDateString();
        $endDate = $validated['end_date'] ?? now()->toDateString();

        $fileName = "sales_report_{$startDate}_to_{$endDate}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename="{$fileName}"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($startDate, $endDate) {
            $handle = fopen('php://output', 'w');

            // BOM for UTF-8 Excel support
            fputs($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // CSV Column Headers
            fputcsv($handle, [
                'Order ID',
                'Tracking Token',
                'Customer Name',
                'Order Type',
                'Payment Method',
                'Payment Status',
                'Order Status',
                'Total Amount (PHP)',
                'Items Summary',
                'Order Date',
            ]);

            // Query verified and placed orders in range (excluding cancelled)
            $orders = Order::with('items.menuItem')
                ->where('order_status', '!=', 'cancelled')
                ->whereDate('created_at', '>=', $startDate)
                ->whereDate('created_at', '<=', $endDate)
                ->orderBy('created_at', 'desc')
                ->cursor();

            foreach ($orders as $order) {
                $itemsSummary = $order->items->map(function ($item) {
                    $name = $item->menuItem ? $item->menuItem->name : 'Item';
                    return "{$item->quantity}x {$name}";
                })->implode('; ');

                $orderTypeLabel = $order->order_type === 'dine-in'
                    ? 'Dine-in (Counter Pickup)'
                    : ucfirst($order->order_type);

                fputcsv($handle, [
                    $order->id,
                    $order->tracking_token,
                    $order->customer_name,
                    $orderTypeLabel,
                    strtoupper($order->payment_method),
                    ucfirst($order->payment_status),
                    ucfirst($order->order_status),
                    number_format($order->total_amount, 2, '.', ''),
                    $itemsSummary,
                    $order->created_at->toIso8601String(),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
