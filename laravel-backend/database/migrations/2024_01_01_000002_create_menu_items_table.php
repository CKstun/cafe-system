<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // Non-Espresso, Refreshers, Hot Blend, Frappe, etc.
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('size')->nullable(); // '12oz', '16oz', '22oz', 'Small', 'Medium', 'Large', 'XL', or Null
            $table->string('milk_type')->nullable(); // 'regular', 'oat', or Null
            $table->decimal('price', 10, 2);
            $table->string('image_path')->nullable();
            $table->integer('stock_quantity')->default(50);
            $table->boolean('track_inventory')->default(true);
            $table->boolean('is_available')->default(true);
            $table->string('flavor')->nullable();
            $table->string('base_item')->nullable();
            $table->timestamps();

            $table->index(['category', 'is_available']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};