<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Events\OrderStatusUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffOrderVerificationController extends Controller
{
    /**
     * Verify payment (Cash or GCash proof of payment) and transition order to Kitchen preparation.
     * Route: POST /api/staff/orders/{order}/verify-payment
     */
    public function verifyPayment(Request $request, Order $order): JsonResponse
    {
        // 1. Authorize staff permissions via Sanctum / Spatie token ability
        if (!$request->user() || !$request->user()->tokenCan('role:staff')) {
            return response()->json(['message' => 'Unauthorized. Staff ability required.'], 403);
        }

        // 2. Ensure order is in pending verification state
        if ($order->order_status !== 'pending') {
            return response()->json([
                'message' => "Order #{$order->tracking_token} is already in '{$order->order_status}' status.",
            ], 422);
        }

        // 3. Perform atomic state transition and inventory deduction
        DB::transaction(function () use ($order, $request) {
            $order->update([
                'payment_status' => 'paid',
                'order_status' => 'preparing',
                'verified_by_user_id' => $request->user()->id,
                'verified_at' => now(),
            ]);

            // Atomically lock and deduct recipe and cup container stock
            $order->markAsPaid();
        });

        // 4. Broadcast real-time event to customer Livewire tracker
        broadcast(new OrderStatusUpdated($order, 'preparing'))->toOthers();

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->tracking_token} payment successfully verified. Sent to kitchen preparation.",
            'order' => [
                'id' => $order->id,
                'tracking_token' => $order->tracking_token,
                'order_status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'verified_at' => $order->verified_at,
            ],
        ]);
    }

    /**
     * Reject an order with invalid payment receipt, mismatch, or counter non-payment.
     * Route: POST /api/staff/orders/{order}/reject
     */
    public function rejectOrder(Request $request, Order $order): JsonResponse
    {
        // 1. Authorize staff permissions
        if (!$request->user() || !$request->user()->tokenCan('role:staff')) {
            return response()->json(['message' => 'Unauthorized. Staff ability required.'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($order, $validated, $request) {
            $order->update([
                'order_status' => 'cancelled',
                'cancellation_reason' => $validated['reason'],
                'rejected_by_user_id' => $request->user()->id,
                'rejected_at' => now(),
            ]);

            // Release table if dine-in order
            if ($order->table_id && $order->table) {
                $order->table->update(['status' => 'available']);
            }
        });

        // Broadcast cancellation to customer Livewire tracker
        broadcast(new OrderStatusUpdated($order, 'cancelled'))->toOthers();

        return response()->json([
            'success' => true,
            'message' => "Order #{$order->tracking_token} has been rejected.",
            'order' => [
                'id' => $order->id,
                'tracking_token' => $order->tracking_token,
                'order_status' => 'cancelled',
                'cancellation_reason' => $validated['reason'],
            ],
        ]);
    }
}
