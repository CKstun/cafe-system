<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\MenuItemSize;
use App\Models\VariantRecipeRule;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MenuItemController extends Controller
{
    /**
     * Update a menu item and its nested configurations transactionally.
     * Route: PUT /api/admin/menu-items/{id}
     *
     * Handles:
     * 1. Product details (name, category, price, description, status, image)
     * 2. Size variants & custom pricing
     * 3. Bill of Materials (BOM) recipe mappings per variant
     * 4. Direct inventory stock overrides and raw restock deltas
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // 1. Authorize Sanctum token or Spatie permission
        $user = $request->user();
        if (!$user || (!$user->tokenCan('role:admin') && !$user->can('manage-menu-items'))) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin privileges required to update menu catalog.',
            ], 403);
        }

        // 2. Validate single transactional payload
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'is_available' => 'boolean',
            'stock_quantity' => 'nullable|integer|min:0',
            'image' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:5120',
            'image_path' => 'nullable|string',

            // Nested Size Variants
            'available_sizes' => 'nullable|array',
            'available_sizes.*.size' => 'required_with:available_sizes|string',
            'available_sizes.*.price' => 'required_with:available_sizes|numeric|min:0',
            'available_sizes.*.oat_price' => 'nullable|numeric|min:0',

            // Nested BOM Recipe Mappings
            'recipes' => 'nullable|array',
            'recipes.*.variant_size' => 'required_with:recipes|string',
            'recipes.*.inventory_item_id' => 'required_with:recipes|exists:inventory_items,id',
            'recipes.*.quantity_deducted' => 'required_with:recipes|integer|min:1',

            // Nested Stock Adjustments (Restock deltas)
            'stock_adjustments' => 'nullable|array',
            'stock_adjustments.*.inventory_item_id' => 'required_with:stock_adjustments|exists:inventory_items,id',
            'stock_adjustments.*.add_quantity' => 'required_with:stock_adjustments|integer|min:1',
        ]);

        $menuItem = MenuItem::findOrFail($id);

        // 3. Execute all modifications within an atomic database transaction
        return DB::transaction(function () use ($request, $validated, $menuItem, $user) {
            // A. Handle file upload if provided via multipart/form-data
            if ($request->hasFile('image')) {
                // Delete old uploaded image if stored on disk
                if ($menuItem->image_path && Storage::disk('public')->exists($menuItem->image_path)) {
                    Storage::disk('public')->delete($menuItem->image_path);
                }
                $storedPath = $request->file('image')->store('menu-items', 'public');
                $menuItem->image_path = Storage::url($storedPath);
            } elseif (isset($validated['image_path'])) {
                $menuItem->image_path = $validated['image_path'];
            }

            // B. Update core Product Details
            $menuItem->name = $validated['name'];
            $menuItem->category = $validated['category'];
            $menuItem->price = $validated['price'];
            $menuItem->description = $validated['description'] ?? $menuItem->description;
            if (isset($validated['is_available'])) {
                $menuItem->is_available = $validated['is_available'];
            }
            if (isset($validated['stock_quantity'])) {
                $menuItem->stock_quantity = $validated['stock_quantity'];
            }
            $menuItem->save();

            // C. Sync Size Variants & Pricing
            if (isset($validated['available_sizes'])) {
                // Remove outdated sizes not present in new payload
                $incomingSizeNames = collect($validated['available_sizes'])->pluck('size')->toArray();
                MenuItemSize::where('menu_item_id', $menuItem->id)
                    ->whereNotIn('size', $incomingSizeNames)
                    ->delete();

                foreach ($validated['available_sizes'] as $v) {
                    MenuItemSize::updateOrCreate(
                        [
                            'menu_item_id' => $menuItem->id,
                            'size' => $v['size'],
                        ],
                        [
                            'price' => $v['price'],
                            'oat_price' => $v['oat_price'] ?? $v['price']
                        ]
                    );
                }
            }

            // D. Sync Bill of Materials (BOM) Recipe Rules
            if (isset($validated['recipes'])) {
                // Replace BOM rules for this menu item
                VariantRecipeRule::where('menu_item_id', $menuItem->id)->delete();

                foreach ($validated['recipes'] as $recipe) {
                    VariantRecipeRule::create([
                        'menu_item_id' => $menuItem->id,
                        'variant_size' => $recipe['variant_size'],
                        'inventory_item_id' => $recipe['inventory_item_id'],
                        'quantity_deducted' => $recipe['quantity_deducted'],
                    ]);
                }
            }

            // E. Process Quick Restock / Stock Adjustments
            if (!empty($validated['stock_adjustments'])) {
                foreach ($validated['stock_adjustments'] as $adjustment) {
                    $rawItem = InventoryItem::lockForUpdate()->find($adjustment['inventory_item_id']);
                    if ($rawItem && $adjustment['add_quantity'] > 0) {
                        $rawItem->increment('stock_quantity', $adjustment['add_quantity']);

                        // Record audit log for traceability
                        InventoryLog::create([
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                            'menu_item_id' => $menuItem->id,
                            'item_name' => $rawItem->name,
                            'change_type' => 'restock',
                            'quantity_changed' => $adjustment['add_quantity'],
                            'notes' => "Quick restock for {$menuItem->name} via Unified Item Edit Modal",
                        ]);
                    }
                }
            }

            // Load fresh relations for consolidated frontend state update
            $menuItem->load(['sizes', 'recipeRules.inventoryItem']);

            return response()->json([
                'success' => true,
                'message' => 'Menu item, size variants, BOM recipes, and inventory restocked successfully.',
                'data' => [
                    'item' => $menuItem,
                    'available_sizes' => $menuItem->sizes,
                    'recipes' => $menuItem->recipeRules,
                ],
            ], 200);
        });
    }
}
