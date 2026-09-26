<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_number')->nullable()->index();
            $table->uuid('guest_session_id')->nullable()->index();
            $table->foreignId('table_id')->nullable()->constrained('tables')->nullOnDelete();
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_method', ['cash', 'online']);
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->enum('order_status', ['pending', 'preparing', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->string('tracking_token', 64)->unique();
            $table->string('customer_name');
            $table->enum('order_type', ['dine-in', 'take-out'])->default('dine-in');
            $table->boolean('cancellation_requested')->default(false);
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index(['order_status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};