export interface LaravelFile {
  path: string;
  category: 'Migration' | 'Model' | 'Seeder' | 'Livewire' | 'Blade View' | 'Deployment' | 'Security & RBAC' | 'Events & Echo' | 'Routes & Config' | 'FormRequest' | 'Controller';
  description: string;
  code: string;
}

export const LARAVEL_CODEBASE: LaravelFile[] = [
  // ==================== MIGRATIONS ====================
  {
    path: 'database/migrations/0001_01_01_000000_create_users_table.php',
    category: 'Migration',
    description: 'Creates users table with role column for Admin & Staff access separation',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'staff'])->default('staff');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000001_create_tables_table.php',
    category: 'Migration',
    description: 'Cafe dine-in tables with availability status and QR code tokens',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('table_number')->unique();
            $table->enum('status', ['available', 'occupied'])->default('available');
            $table->string('qr_token')->unique()->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tables');
    }
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000002_create_menu_items_table.php',
    category: 'Migration',
    description: 'Menu items schema with sizes, milk options, stock tracking & pricing',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

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
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000003_create_add_ons_table.php',
    category: 'Migration',
    description: 'Add-ons table for espresso shots, syrups, toppings, and dairy alternatives',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('add_ons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->integer('stock_quantity')->default(100);
            $table->boolean('track_inventory')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('add_ons');
    }
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000004_create_orders_table.php',
    category: 'Migration',
    description: 'Customer orders table with payment status, order tracking token, and dine-in/take-out',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
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
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000005_create_order_items_table.php',
    category: 'Migration',
    description: 'Order items with JSON customizations (flavors, add-ons, sugar/ice comments)',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->constrained('menu_items');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->json('customizations')->nullable(); // size, flavor, milk_type, add_ons, comments
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};`,
  },
  {
    path: 'database/migrations/2024_01_01_000006_create_inventory_logs_table.php',
    category: 'Migration',
    description: 'Inventory audit logs tracking sales deductions, manual restocks, and wastage',
    code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->foreignId('add_on_id')->nullable()->constrained('add_ons')->nullOnDelete();
            $table->enum('change_type', ['sale', 'restock', 'wastage']);
            $table->integer('quantity_changed'); // Negative for sales/wastage, positive for restock
            $table->string('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};`,
  },

  // ==================== MODELS ====================
  {
    path: 'app/Models/User.php',
    category: 'Model',
    description: 'User model with role helpers (isAdmin, isStaff) and inventory log relations',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }
}`,
  },
  {
    path: 'app/Models/CafeTable.php',
    category: 'Model',
    description: 'Cafe Table model with orders relationship and QR generation',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class CafeTable extends Model
{
    protected $table = 'tables';

    protected $fillable = [
        'table_number',
        'status',
        'qr_token',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'table_id');
    }

    public function currentActiveOrder()
    {
        return $this->orders()
            ->whereIn('order_status', ['pending', 'preparing', 'ready'])
            ->latest()
            ->first();
    }
}`,
  },
  {
    path: 'app/Models/MenuItem.php',
    category: 'Model',
    description: 'Menu Item model with inventory deduct logic and category scopes',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'category',
        'name',
        'description',
        'size',
        'milk_type',
        'price',
        'image_path',
        'stock_quantity',
        'track_inventory',
        'is_available',
        'flavor',
        'base_item',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'track_inventory' => 'boolean',
        'is_available' => 'boolean',
    ];

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}`,
  },
  {
    path: 'app/Models/AddOn.php',
    category: 'Model',
    description: 'Add-on model with stock tracking and price attributes',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;

class AddOn extends Model
{
    protected $fillable = [
        'name',
        'price',
        'stock_quantity',
        'track_inventory',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'track_inventory' => 'boolean',
    ];

    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}`,
  },
  {
    path: 'app/Models/Order.php',
    category: 'Model',
    description: 'Order model featuring lockForUpdate() inventory deduction upon payment',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Str;

class Order extends Model
{
    protected $fillable = [
        'table_id',
        'total_amount',
        'payment_method',
        'payment_status',
        'order_status',
        'tracking_token',
        'customer_name',
        'order_type',
        'cancellation_requested',
        'cancellation_reason',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'cancellation_requested' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->tracking_token)) {
                $order->tracking_token = 'CP-' . strtoupper(Str::random(6));
            }
        });
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(CafeTable::class, 'table_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Mark order as paid and atomically deduct inventory with lockForUpdate()
     */
    public function markAsPaid(?int $staffUserId = null): void
    {
        DB::transaction(function () use ($staffUserId) {
            // Lock the order record
            $lockedOrder = Order::where('id', $this->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->payment_status === 'paid') {
                return; // Already processed
            }

            $lockedOrder->update([
                'payment_status' => 'paid',
                'order_status' => $lockedOrder->order_status === 'pending' ? 'preparing' : $lockedOrder->order_status,
            ]);

            // Deduct stock for each item using lockForUpdate()
            foreach ($lockedOrder->items as $item) {
                if ($item->menu_item_id) {
                    $menuItem = MenuItem::where('id', $item->menu_item_id)->lockForUpdate()->first();
                    if ($menuItem && $menuItem->track_inventory) {
                        $menuItem->decrement('stock_quantity', $item->quantity);

                        InventoryLog::create([
                            'user_id' => $staffUserId,
                            'menu_item_id' => $menuItem->id,
                            'add_on_id' => null,
                            'change_type' => 'sale',
                            'quantity_changed' => -$item->quantity,
                            'notes' => "Order #{$lockedOrder->tracking_token} deduction",
                        ]);
                    }
                }

                // Check add-ons in customizations
                $customizations = $item->customizations ?? [];
                if (!empty($customizations['add_ons'])) {
                    foreach ($customizations['add_ons'] as $addOnData) {
                        $addOn = AddOn::where('id', $addOnData['id'])->lockForUpdate()->first();
                        if ($addOn && $addOn->track_inventory) {
                            $addOn->decrement('stock_quantity', $item->quantity);

                            InventoryLog::create([
                                'user_id' => $staffUserId,
                                'menu_item_id' => null,
                                'add_on_id' => $addOn->id,
                                'change_type' => 'sale',
                                'quantity_changed' => -$item->quantity,
                                'notes' => "Order #{$lockedOrder->tracking_token} add-on: {$addOn->name}",
                            ]);
                        }
                    }
                }
            }
        });
    }
}`,
  },
  {
    path: 'app/Models/OrderItem.php',
    category: 'Model',
    description: 'OrderItem model casting customizations JSON to array',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'menu_item_id',
        'quantity',
        'price',
        'customizations',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'customizations' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }
}`,
  },
  {
    path: 'app/Models/InventoryLog.php',
    category: 'Model',
    description: 'InventoryLog model with relationships to User, MenuItem, and AddOn',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class InventoryLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'menu_item_id',
        'add_on_id',
        'change_type',
        'quantity_changed',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'quantity_changed' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function addOn(): BelongsTo
    {
        return $this->belongsTo(AddOn::class);
    }
}`,
  },

  // ==================== SEEDER ====================
  {
    path: 'database/seeders/MenuSeeder.php',
    category: 'Seeder',
    description: 'Complete seeder with automatic flavor parsing into separate database rows',
    code: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\Hash;
use App\\Models\\User;
use App\\Models\\CafeTable;
use App\\Models\\MenuItem;
use App\\Models\\AddOn;

class MenuSeeder extends Seeder
{
    /**
     * Seed the database with Cafe Pepita initial users, tables, add-ons, and menu items.
     * Automatically parses flavors (e.g. Fruit Soda flavors) into individual rows.
     */
    public function run(): void
    {
        // 1. Default Administrator & Staff Accounts
        User::firstOrCreate(
            ['email' => 'admin@cafepita.com'],
            [
                'name' => 'Café Pepita Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'staff@cafepita.com'],
            [
                'name' => 'Barista Staff',
                'password' => Hash::make('staff123'),
                'role' => 'staff',
                'is_active' => true,
            ]
        );

        // 2. Dine-In Tables (1 through 10)
        for ($i = 1; $i <= 10; $i++) {
            CafeTable::firstOrCreate(
                ['table_number' => $i],
                [
                    'status' => 'available',
                    'qr_token' => 'TABLE-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                ]
            );
        }

        // 3. Global Add-Ons
        $addOns = [
            ['name' => 'Espresso Shot', 'price' => 30.00, 'stock_quantity' => 150],
            ['name' => 'Oat Milk Sub', 'price' => 40.00, 'stock_quantity' => 50],
            ['name' => 'Vanilla Syrup', 'price' => 20.00, 'stock_quantity' => 80],
            ['name' => 'Caramel Drizzle', 'price' => 20.00, 'stock_quantity' => 90],
            ['name' => 'Coffee Jelly', 'price' => 25.00, 'stock_quantity' => 60],
            ['name' => 'Whipped Cream', 'price' => 25.00, 'stock_quantity' => 50],
            ['name' => 'Nata de Coco', 'price' => 20.00, 'stock_quantity' => 70],
            ['name' => 'Extra Cheese Sauce', 'price' => 25.00, 'stock_quantity' => 40],
        ];

        foreach ($addOns as $addOn) {
            AddOn::firstOrCreate(['name' => $addOn['name']], $addOn);
        }

        // 4. Raw Menu Pricing Data Matrix with Flavor Parser
        $menuItemsRaw = [
            // Signature Blend
            [
                'category' => 'Signature Blend',
                'name' => 'Pepita Signature Spanish Latte',
                'description' => 'Espresso pulled over sweet condensed milk and chilled microfoam.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 135.00,
                'image_path' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
                'stock_quantity' => 60,
            ],
            [
                'category' => 'Signature Blend',
                'name' => 'Dirty Matcha Espresso',
                'description' => 'Ceremonial Uji matcha layered with cold milk and bold espresso shot.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 145.00,
                'image_path' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
                'stock_quantity' => 45,
            ],
            [
                'category' => 'Signature Blend',
                'name' => 'Sea Salt Caramel Latte',
                'description' => 'Velvety espresso with house butter caramel and salted cream foam.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 140.00,
                'image_path' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
                'stock_quantity' => 50,
            ],

            // Classic Blend
            [
                'category' => 'Classic Blend',
                'name' => 'Iced Cafe Latte',
                'description' => 'Double espresso balanced with silky whole milk over crystal ice.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 110.00,
                'image_path' => 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600',
                'stock_quantity' => 80,
            ],
            [
                'category' => 'Classic Blend',
                'name' => 'Iced Caramel Macchiato',
                'description' => 'Chilled milk marked with espresso, Madagascar vanilla, and caramel lattice.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 125.00,
                'image_path' => 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600',
                'stock_quantity' => 55,
            ],
            [
                'category' => 'Classic Blend',
                'name' => 'Iced Cafe Mocha',
                'description' => 'Dutch dark cocoa infused with espresso and cold milk.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 125.00,
                'image_path' => 'https://images.unsplash.com/photo-1578314670559-0f669a9ec2b1?w=600',
                'stock_quantity' => 60,
            ],

            // Americano Series
            [
                'category' => 'Americano Series',
                'name' => 'Classic Iced Americano',
                'description' => 'Double shot espresso over cold filtered water and ice rocks.',
                'size' => '16oz',
                'milk_type' => null,
                'price' => 90.00,
                'image_path' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
                'stock_quantity' => 100,
            ],
            [
                'category' => 'Americano Series',
                'name' => 'Spanish Americano',
                'description' => 'Long black espresso touched with delicate condensed sweetness.',
                'size' => '16oz',
                'milk_type' => null,
                'price' => 105.00,
                'image_path' => 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
                'stock_quantity' => 70,
            ],

            // Hot Blend
            [
                'category' => 'Hot Blend',
                'name' => 'Hot Fresh Cappuccino',
                'description' => 'Equal balance of dark espresso, steamed milk, and rich microfoam.',
                'size' => '12oz',
                'milk_type' => 'regular',
                'price' => 100.00,
                'image_path' => 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600',
                'stock_quantity' => 90,
            ],
            [
                'category' => 'Hot Blend',
                'name' => 'Hot Cafe Latte',
                'description' => 'Gently steamed milk poured through golden espresso with latte art.',
                'size' => '12oz',
                'milk_type' => 'regular',
                'price' => 105.00,
                'image_path' => 'https://images.unsplash.com/photo-1585494156145-1c60a4fe9d2b?w=600',
                'stock_quantity' => 85,
            ],

            // Frappe
            [
                'category' => 'Frappe',
                'name' => 'Java Chip Frappe',
                'description' => 'Blended espresso, Belgian chocolate chunks, and cream swirl.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 155.00,
                'image_path' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600',
                'stock_quantity' => 40,
            ],
            [
                'category' => 'Frappe',
                'name' => 'Caramel Macchiato Frappe',
                'description' => 'Blended caramel drizzle and espresso crowned with whipped cream.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 150.00,
                'image_path' => 'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=600',
                'stock_quantity' => 35,
            ],

            // Non-Espresso
            [
                'category' => 'Non-Espresso',
                'name' => 'Pure Japanese Matcha Latte',
                'description' => 'Whisked green tea matcha paired with fresh sweet milk.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 130.00,
                'image_path' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
                'stock_quantity' => 50,
            ],
            [
                'category' => 'Non-Espresso',
                'name' => 'Belgian Signature Chocolate',
                'description' => 'Deep melted Belgian cocoa ganache whisked with whole milk.',
                'size' => '16oz',
                'milk_type' => 'regular',
                'price' => 120.00,
                'image_path' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600',
                'stock_quantity' => 60,
            ],

            // Refreshers (Special: Parsed flavors requirement!)
            [
                'category' => 'Refreshers',
                'name' => 'Fruit Soda',
                'flavors' => ['Lychee', 'Mango', 'Green Apple', 'Blueberry'],
                'description' => 'Sparkling Italian soda spritzed over ice.',
                'size' => '16oz',
                'milk_type' => null,
                'price' => 95.00,
                'image_path' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
                'stock_quantity' => 70,
            ],

            // Kitchen Items
            [
                'category' => 'Kitchen Items',
                'name' => 'Pepita Prime Tapsilog',
                'description' => 'Garlic-marinated tender beef tapa with sinangag rice and egg.',
                'size' => 'Regular',
                'milk_type' => null,
                'price' => 185.00,
                'image_path' => 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
                'stock_quantity' => 35,
            ],
            [
                'category' => 'Kitchen Items',
                'name' => 'Pork Tocilog Special',
                'description' => 'Sweet caramelized pork tocino with garlic fried rice and egg.',
                'size' => 'Regular',
                'milk_type' => null,
                'price' => 175.00,
                'image_path' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
                'stock_quantity' => 28,
            ],
            [
                'category' => 'Kitchen Items',
                'name' => 'Crispy Truffle Parmesan Fries',
                'description' => 'Shoestring fries tossed with truffle oil and shaved parmesan.',
                'size' => 'Regular',
                'milk_type' => null,
                'price' => 140.00,
                'image_path' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
                'stock_quantity' => 45,
            ],

            // Party Trays
            [
                'category' => 'Party Trays',
                'name' => 'Creamy Bacon Carbonara Tray',
                'description' => 'Pasta tossed in rich yolk cream, crispy bacon, and parmesan. Serves 6-8.',
                'size' => 'Large',
                'milk_type' => null,
                'price' => 850.00,
                'image_path' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600',
                'stock_quantity' => 12,
            ],
            [
                'category' => 'Party Trays',
                'name' => 'Homestyle Beef Lasagna Tray',
                'description' => 'Layers of pasta sheets, slow-simmered bolognese, and baked mozzarella.',
                'size' => 'Large',
                'milk_type' => null,
                'price' => 950.00,
                'image_path' => 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600',
                'stock_quantity' => 8,
            ],
        ];

        // Seed products and automatically explode multi-flavor items into individual rows
        foreach ($menuItemsRaw as $item) {
            if (!empty($item['flavors'])) {
                foreach ($item['flavors'] as $flavor) {
                    MenuItem::firstOrCreate(
                        [
                            'category' => $item['category'],
                            'name' => "{$item['name']} - {$flavor}",
                        ],
                        [
                            'description' => $item['description'] . " Flavor: {$flavor}.",
                            'size' => $item['size'],
                            'milk_type' => $item['milk_type'],
                            'price' => $item['price'],
                            'image_path' => $item['image_path'],
                            'stock_quantity' => $item['stock_quantity'],
                            'track_inventory' => true,
                            'is_available' => true,
                            'flavor' => $flavor,
                            'base_item' => $item['name'],
                        ]
                    );
                }
            } else {
                MenuItem::firstOrCreate(
                    [
                        'category' => $item['category'],
                        'name' => $item['name'],
                    ],
                    [
                        'description' => $item['description'],
                        'size' => $item['size'],
                        'milk_type' => $item['milk_type'],
                        'price' => $item['price'],
                        'image_path' => $item['image_path'],
                        'stock_quantity' => $item['stock_quantity'],
                        'track_inventory' => true,
                        'is_available' => true,
                        'flavor' => null,
                        'base_item' => null,
                    ]
                );
            }
        }
    }
}`,
  },

  // ==================== LIVEWIRE COMPONENTS ====================
  {
    path: 'app/Livewire/CustomerOrdering.php',
    category: 'Livewire',
    description: 'Livewire v3 Component for Screens 1-7 (Splash, Onboarding, Catalog, Customization, Cart, Payment)',
    code: `<?php

namespace App\\Livewire;

use Livewire\\Component;
use App\\Models\\MenuItem;
use App\\Models\\AddOn;
use App\\Models\\CafeTable;
use App\\Models\\Order;
use App\\Models\\OrderItem;
use Illuminate\\Support\\Facades\\DB;

class CustomerOrdering extends Component
{
    // Navigation Screen State: 1 = Splash, 2 = Onboarding, 3 = Catalog, 6 = Cart, 7 = Payment
    public int $currentScreen = 1;

    // Customer Session Details
    public string $customerName = '';
    public string $orderType = 'dine-in'; // 'dine-in' or 'take-out'
    public ?int $selectedTableId = null;

    // Menu Filtering
    public string $selectedCategory = 'All';
    public string $searchQuery = '';

    // Customization Modal State (Screens 4 & 5)
    public bool $showItemModal = false;
    public ?MenuItem $selectedItem = null;
    public string $customSize = '16oz';
    public ?string $customFlavor = null;
    public string $customMilk = 'regular';
    public array $selectedAddOnIds = [];
    public string $customComments = '';
    public int $modalQuantity = 1;

    // Cart Lines
    public array $cart = []; // [['id', 'item_id', 'name', 'price', 'quantity', 'customizations']]

    // Payment State (Screen 7)
    public string $paymentMethod = 'cash'; // 'cash' or 'online'
    public string $onlineRefNumber = '';

    protected $rules = [
        'customerName' => 'required|min:2|max:50',
        'orderType' => 'required|in:dine-in,take-out',
    ];

    public function mount(?string $table = null)
    {
        if ($table) {
            $matchedTable = CafeTable::where('qr_token', $table)
                ->orWhere('table_number', $table)
                ->first();
            if ($matchedTable) {
                $this->selectedTableId = $matchedTable->id;
                $this->orderType = 'dine-in';
            }
        }
    }

    public function startOrdering()
    {
        $this->currentScreen = 2; // Move to Welcome Onboard form
    }

    public function submitCustomerInfo()
    {
        $this->validate([
            'customerName' => 'required|min:2|string',
            'orderType' => 'required|in:dine-in,take-out',
            'selectedTableId' => 'required_if:orderType,dine-in',
        ], [
            'customerName.required' => 'Please enter your name to proceed.',
            'selectedTableId.required_if' => 'Please select a table number for dine-in.',
        ]);

        $this->currentScreen = 3; // Move to Catalog
    }

    public function openItemModal(int $itemId)
    {
        $this->selectedItem = MenuItem::findOrFail($itemId);
        $this->customSize = $this->selectedItem->size ?: '16oz';
        $this->customFlavor = $this->selectedItem->flavor;
        $this->customMilk = $this->selectedItem->milk_type ?: 'regular';
        $this->selectedAddOnIds = [];
        $this->customComments = '';
        $this->modalQuantity = 1;
        $this->showItemModal = true;
    }

    public function toggleAddOn(int $addOnId)
    {
        if (in_array($addOnId, $this->selectedAddOnIds)) {
            $this->selectedAddOnIds = array_diff($this->selectedAddOnIds, [$addOnId]);
        } else {
            $this->selectedAddOnIds[] = $addOnId;
        }
    }

    public function incrementModalQty()
    {
        $this->modalQuantity++;
    }

    public function decrementModalQty()
    {
        if ($this->modalQuantity > 1) {
            $this->modalQuantity--;
        }
    }

    public function getItemModalPriceProperty(): float
    {
        if (!$this->selectedItem) return 0.00;

        $base = (float) $this->selectedItem->price;
        if ($this->customSize === '22oz') $base += 20;

        $addOnsTotal = AddOn::whereIn('id', $this->selectedAddOnIds)->sum('price');
        return ($base + $addOnsTotal) * $this->modalQuantity;
    }

    public function addItemToCart()
    {
        if (!$this->selectedItem) return;

        $chosenAddOns = AddOn::whereIn('id', $this->selectedAddOnIds)->get();
        $singleItemBase = (float) $this->selectedItem->price + ($this->customSize === '22oz' ? 20 : 0);
        $addOnsPrice = $chosenAddOns->sum('price');
        $unitPrice = $singleItemBase + $addOnsPrice;

        $cartId = uniqid('cart_');

        $this->cart[] = [
            'cart_id' => $cartId,
            'item_id' => $this->selectedItem->id,
            'name' => $this->selectedItem->name,
            'price' => $unitPrice,
            'quantity' => $this->modalQuantity,
            'image_path' => $this->selectedItem->image_path,
            'customizations' => [
                'size' => $this->customSize,
                'flavor' => $this->customFlavor,
                'milk_type' => $this->customMilk,
                'add_ons' => $chosenAddOns->map(fn($a) => ['id' => $a->id, 'name' => $a->name, 'price' => $a->price])->toArray(),
                'comments' => $this->customComments,
            ],
        ];

        $this->showItemModal = false;
    }

    public function updateCartQuantity(string $cartId, int $delta)
    {
        foreach ($this->cart as $index => $item) {
            if ($item['cart_id'] === $cartId) {
                $newQty = $item['quantity'] + $delta;
                if ($newQty <= 0) {
                    unset($this->cart[$index]);
                    $this->cart = array_values($this->cart);
                } else {
                    $this->cart[$index]['quantity'] = $newQty;
                }
                break;
            }
        }
    }

    public function removeCartItem(string $cartId)
    {
        $this->cart = array_values(array_filter($this->cart, fn($i) => $i['cart_id'] !== $cartId));
    }

    public function getSubtotalProperty(): float
    {
        return array_reduce($this->cart, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0);
    }

    public function proceedToPayment()
    {
        if (empty($this->cart)) return;
        $this->currentScreen = 7;
    }

    public function submitOrder()
    {
        if (empty($this->cart)) return;

        $createdOrder = DB::transaction(function () {
            $order = Order::create([
                'table_id' => $this->orderType === 'dine-in' ? $this->selectedTableId : null,
                'customer_name' => $this->customerName,
                'order_type' => $this->orderType,
                'total_amount' => $this->subtotal,
                'payment_method' => $this->paymentMethod,
                'payment_status' => $this->paymentMethod === 'online' ? 'paid' : 'unpaid',
                'order_status' => 'pending',
            ]);

            foreach ($this->cart as $line) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $line['item_id'],
                    'quantity' => $line['quantity'],
                    'price' => $line['price'],
                    'customizations' => $line['customizations'],
                ]);
            }

            // If online GCash was paid immediately, deduct stock
            if ($order->payment_status === 'paid') {
                $order->markAsPaid();
            }

            return $order;
        });

        // Redirect to live order tracking screen
        return redirect()->route('order.tracker', ['token' => $createdOrder->tracking_token]);
    }

    public function render()
    {
        $categories = MenuItem::select('category')->distinct()->pluck('category');

        $menuQuery = MenuItem::where('is_available', true);

        if ($this->selectedCategory !== 'All') {
            $menuQuery->where('category', $this->selectedCategory);
        }

        if (!empty($this->searchQuery)) {
            $menuQuery->where(function ($q) {
                $q->where('name', 'like', "%{$this->searchQuery}%")
                  ->orWhere('description', 'like', "%{$this->searchQuery}%");
            });
        }

        return view('livewire.customer-ordering', [
            'categories' => $categories,
            'menuItems' => $menuQuery->get(),
            'addOnsList' => AddOn::where('stock_quantity', '>', 0)->get(),
            'tables' => CafeTable::all(),
        ])->layout('layouts.app');
    }
}`,
  },
  {
    path: 'app/Livewire/OrderTracker.php',
    category: 'Livewire',
    description: 'Screen 8: Real-time order pipeline tracker with wire:poll.3s & cancellation restrictions',
    code: `<?php

namespace App\\Livewire;

use Livewire\\Component;
use App\\Models\\Order;

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
}`,
  },
  {
    path: 'app/Livewire/StaffDashboard.php',
    category: 'Livewire',
    description: 'Staff POS/KDS queue with cash payment approval, status transitions, and cancellation controls',
    code: `<?php

namespace App\\Livewire;

use Livewire\\Component;
use App\\Models\\Order;
use Illuminate\\Support\\Facades\\Auth;

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
}`,
  },
  {
    path: 'app/Livewire/AdminDashboard.php',
    category: 'Livewire',
    description: 'Admin Control Panel: Staff CRUD, Product Catalog, Unit Bottleneck Inventory with lockForUpdate(), and Sales Reports',
    code: `<?php

namespace App\\Livewire;

use Livewire\\Component;
use App\\Models\\User;
use App\\Models\\MenuItem;
use App\\Models\\Order;
use App\\Models\\OrderItem;
use App\\Models\\InventoryLog;
use Illuminate\\Support\\Facades\\Hash;
use Illuminate\\Support\\Facades\\DB;
use Carbon\\Carbon;

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
}`,
  },

  // ==================== BLADE VIEWS ====================
  {
    path: 'resources/views/livewire/customer-ordering.blade.php',
    category: 'Blade View',
    description: 'Blade view implementing Screens 1-7 using Cafe Pepita warm cream and espresso palette',
    code: `{{-- resources/views/livewire/customer-ordering.blade.php --}}
<div class="min-h-screen bg-[#FDFBF7] text-[#2B231F] font-sans antialiased max-w-md mx-auto relative pb-24 shadow-2xl border-x border-[#EFE8E1]">

    {{-- SCREEN 1: SPLASH VIEW --}}
    @if($currentScreen === 1)
        <div class="flex flex-col items-center justify-between min-h-screen px-6 py-12 text-center">
            <div class="my-auto space-y-6">
                {{-- Cafe Pepita Logo Badge --}}
                <div class="w-28 h-28 mx-auto rounded-full bg-[#5C4033] flex items-center justify-center shadow-lg ring-4 ring-[#EFE8E1]">
                    <svg class="w-14 h-14 text-[#FDFBF7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                    </svg>
                </div>
                <div>
                    <h1 class="font-display text-4xl font-bold tracking-tight text-[#2B231F]">Café Pepita</h1>
                    <p class="mt-2 text-sm uppercase tracking-widest text-[#8C7A6B] font-semibold">Sip The Moment</p>
                </div>
                <p class="text-xs text-[#736357] max-w-xs mx-auto">
                    Artisanal coffee, handcrafted refreshers, and hearty comforting kitchen favorites.
                </p>
            </div>

            <div class="w-full space-y-3">
                <button wire:click="startOrdering" class="w-full py-4 px-6 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] font-semibold rounded-full shadow-md transition transform active:scale-95 text-base flex items-center justify-center gap-2">
                    <span>Start Ordering</span>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </div>
        </div>

    {{-- SCREEN 2: ONBOARDING / NAME & TABLE SELECTION --}}
    @elseif($currentScreen === 2)
        <div class="min-h-screen p-6 flex flex-col justify-between">
            <div>
                <button wire:click="$set('currentScreen', 1)" class="text-[#8C7A6B] hover:text-[#5C4033] text-sm flex items-center gap-1 mb-6">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    <span>Back</span>
                </button>
                <h2 class="font-display text-2xl font-bold text-[#2B231F]">Welcome Onboard</h2>
                <p class="text-sm text-[#8C7A6B] mt-1">Please provide your details so we can personalize your cafe experience.</p>

                <div class="mt-8 space-y-6">
                    {{-- Customer Name --}}
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Your Name</label>
                        <input type="text" wire:model.defer="customerName" placeholder="e.g. Cheska Kimberly" 
                               class="w-full px-4 py-3.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-2xl text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                        @error('customerName') <p class="mt-1.5 text-xs text-[#DC2626] font-medium">{{ $message }}</p> @enderror
                    </div>

                    {{-- Order Type Pill Toggle --}}
                    <div>
                        <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Dining Preference</label>
                        <div class="grid grid-cols-2 gap-3 p-1.5 bg-[#EFE8E1] rounded-full">
                            <button type="button" wire:click="$set('orderType', 'dine-in')"
                                    class="py-2.5 rounded-full text-sm font-semibold transition {{ $orderType === 'dine-in' ? 'bg-[#5C4033] text-[#FDFBF7] shadow' : 'text-[#736357]' }}">
                                Dine-in
                            </button>
                            <button type="button" wire:click="$set('orderType', 'take-out')"
                                    class="py-2.5 rounded-full text-sm font-semibold transition {{ $orderType === 'take-out' ? 'bg-[#5C4033] text-[#FDFBF7] shadow' : 'text-[#736357]' }}">
                                Take-out
                            </button>
                        </div>
                    </div>

                    {{-- Table Number Selection (If Dine-in) --}}
                    @if($orderType === 'dine-in')
                        <div class="p-4 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4]">
                            <label class="block text-xs uppercase tracking-wider font-semibold text-[#5C4033] mb-2">Select Your Table</label>
                            <div class="grid grid-cols-5 gap-2">
                                @foreach($tables as $tbl)
                                    <button type="button" wire:click="$set('selectedTableId', {{ $tbl->id }})"
                                            class="py-2.5 rounded-xl text-xs font-bold transition border {{ $selectedTableId == $tbl->id ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#FDFBF7] text-[#5C4033] border-[#E6DDD4]' }}">
                                        T-{{ $tbl->table_number }}
                                    </button>
                                @endforeach
                            </div>
                            @error('selectedTableId') <p class="mt-2 text-xs text-[#DC2626] font-medium">{{ $message }}</p> @enderror
                        </div>
                    @endif
                </div>
            </div>

            <button wire:click="submitCustomerInfo" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-semibold rounded-full shadow-md mt-8">
                Explore Menu
            </button>
        </div>

    {{-- SCREEN 3: MENU CATALOG --}}
    @elseif($currentScreen === 3)
        <div>
            {{-- App Header with Customer Greeting --}}
            <header class="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EFE8E1] px-5 py-3.5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-[#8C7A6B]">Welcome,</p>
                        <h2 class="text-base font-bold text-[#2B231F] flex items-center gap-1.5">
                            <span>{{ $customerName }}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE8E1] text-[#5C4033] uppercase font-semibold">
                                {{ $orderType === 'dine-in' ? "Table $selectedTableId" : 'Take-out' }}
                            </span>
                        </h2>
                    </div>

                    {{-- Cart Icon Button --}}
                    <button wire:click="$set('currentScreen', 6)" class="relative p-2.5 rounded-full bg-[#EFE8E1] text-[#5C4033]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        @if(count($cart) > 0)
                            <span class="absolute -top-1 -right-1 w-5 h-5 bg-[#5C4033] text-[#FDFBF7] text-[10px] font-bold rounded-full flex items-center justify-center">
                                {{ array_sum(array_column($cart, 'quantity')) }}
                            </span>
                        @endif
                    </button>
                </div>

                {{-- Search Bar --}}
                <div class="mt-3 relative">
                    <input type="text" wire:model.live.debounce.300ms="searchQuery" placeholder="Search drinks, rice bowls, snacks..."
                           class="w-full pl-10 pr-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-full text-xs text-[#2B231F] placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                    <svg class="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>

                {{-- Horizontal Category Pills --}}
                <div class="flex gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
                    <button wire:click="$set('selectedCategory', 'All')"
                            class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition {{ $selectedCategory === 'All' ? 'bg-[#5C4033] text-[#FDFBF7]' : 'bg-[#EFE8E1] text-[#736357]' }}">
                        All
                    </button>
                    @foreach($categories as $cat)
                        <button wire:click="$set('selectedCategory', '{{ $cat }}')"
                                class="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition {{ $selectedCategory === $cat ? 'bg-[#5C4033] text-[#FDFBF7]' : 'bg-[#EFE8E1] text-[#736357]' }}">
                            {{ $cat }}
                        </button>
                    @endforeach
                </div>
            </header>

            {{-- Menu Grid --}}
            <div class="p-5 grid grid-cols-2 gap-3.5">
                @forelse($menuItems as $item)
                    <div class="bg-[#FDFBF7] border border-[#EFE8E1] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-2.5 group hover:border-[#D9CDC1] transition">
                        <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EFE8E1]">
                            <img src="{{ $item->image_path }}" alt="{{ $item->name }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                            @if($item->size)
                                <span class="absolute top-2 left-2 bg-[#FDFBF7]/90 backdrop-blur-sm text-[#5C4033] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {{ $item->size }}
                                </span>
                            @endif
                        </div>

                        <div class="mt-2.5 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 class="font-bold text-xs text-[#2B231F] line-clamp-1">{{ $item->name }}</h3>
                                <p class="text-[10px] text-[#8C7A6B] line-clamp-2 mt-0.5">{{ $item->description }}</p>
                            </div>

                            <div class="mt-3 flex items-center justify-between pt-2 border-t border-[#F4EFEB]">
                                <span class="font-bold text-xs text-[#5C4033]">₱{{ number_format($item->price, 2) }}</span>
                                <button wire:click="openItemModal({{ $item->id }})" class="w-7 h-7 rounded-full bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow hover:bg-[#4A3328] active:scale-90 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-span-2 py-12 text-center text-xs text-[#8C7A6B]">
                        No items found matching your criteria.
                    </div>
                @endforelse
            </div>

            {{-- Floating Cart Bottom Bar --}}
            @if(count($cart) > 0)
                <div class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
                    <button wire:click="$set('currentScreen', 6)" class="w-full py-3.5 px-5 bg-[#5C4033] text-[#FDFBF7] rounded-full shadow-xl flex items-center justify-between font-bold text-xs tracking-wide">
                        <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] flex items-center justify-center text-[10px]">
                                {{ array_sum(array_column($cart, 'quantity')) }}
                            </span>
                            <span>View Cart</span>
                        </div>
                        <span>₱{{ number_format($this->subtotal, 2) }}</span>
                    </button>
                </div>
            @endif
        </div>

    {{-- SCREENS 4 & 5: ITEM CUSTOMIZATION MODAL --}}
    @if($showItemModal && $selectedItem)
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <div class="bg-[#FDFBF7] w-full max-w-md rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-display text-lg font-bold text-[#2B231F]">{{ $selectedItem->name }}</h3>
                        <p class="text-xs text-[#8C7A6B] mt-0.5">Customize your drink to your exact liking</p>
                    </div>
                    <button wire:click="$set('showItemModal', false)" class="w-8 h-8 rounded-full bg-[#EFE8E1] text-[#736357] flex items-center justify-center">
                        ✕
                    </button>
                </div>

                {{-- Size Selectors --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-2">Cup Size</label>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" wire:click="$set('customSize', '16oz')"
                                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-between {{ $customSize === '16oz' ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                            <span>16oz (Regular)</span>
                            <span>₱{{ number_format($selectedItem->price, 2) }}</span>
                        </button>
                        <button type="button" wire:click="$set('customSize', '22oz')"
                                class="py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-between {{ $customSize === '22oz' ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                            <span>22oz (Large)</span>
                            <span>+₱20.00</span>
                        </button>
                    </div>
                </div>

                {{-- Add-Ons Selection --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-2">Add-Ons & Extras</label>
                    <div class="grid grid-cols-2 gap-2">
                        @foreach($addOnsList as $addon)
                            <button type="button" wire:click="toggleAddOn({{ $addon->id }})"
                                    class="p-2.5 rounded-xl border text-left text-xs transition {{ in_array($addon->id, $selectedAddOnIds) ? 'bg-[#5C4033] text-[#FDFBF7] border-[#5C4033]' : 'bg-[#F4EFEB] text-[#2B231F] border-[#E6DDD4]' }}">
                                <p class="font-semibold">{{ $addon->name }}</p>
                                <p class="text-[10px] opacity-80">+₱{{ number_format($addon->price, 2) }}</p>
                            </button>
                        @endforeach
                    </div>
                </div>

                {{-- Comments / Notes --}}
                <div class="mt-5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-[#5C4033] mb-1.5">Special Instructions</label>
                    <input type="text" wire:model.defer="customComments" placeholder="e.g. Less sugar, extra ice, separate syrup"
                           class="w-full px-4 py-2.5 bg-[#F4EFEB] border border-[#E6DDD4] rounded-2xl text-xs text-[#2B231F] focus:outline-none focus:ring-2 focus:ring-[#5C4033]">
                </div>

                {{-- Quantity and Add Button Floating Footer --}}
                <div class="mt-6 pt-4 border-t border-[#EFE8E1] flex items-center gap-3">
                    <div class="flex items-center bg-[#EFE8E1] rounded-full p-1">
                        <button wire:click="decrementModalQty" class="w-8 h-8 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold flex items-center justify-center">-</button>
                        <span class="w-8 text-center text-xs font-bold">{{ $modalQuantity }}</span>
                        <button wire:click="incrementModalQty" class="w-8 h-8 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold flex items-center justify-center">+</button>
                    </div>

                    <button wire:click="addItemToCart" class="flex-1 py-3.5 bg-[#5C4033] text-[#FDFBF7] font-bold text-xs rounded-full shadow hover:bg-[#4A3328] transition flex items-center justify-between px-5">
                        <span>Add Item</span>
                        <span>₱{{ number_format($this->itemModalPrice, 2) }}</span>
                    </button>
                </div>
            </div>
        </div>
    @endif

    {{-- SCREEN 6: YOUR CART VIEW --}}
    @elseif($currentScreen === 6)
        <div class="min-h-screen p-5 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-[#EFE8E1]">
                    <button wire:click="$set('currentScreen', 3)" class="text-[#8C7A6B] hover:text-[#5C4033] text-xs flex items-center gap-1 font-semibold">
                        ← Back to Menu
                    </button>
                    <h2 class="font-display text-lg font-bold text-[#2B231F]">Your Cart</h2>
                    <span class="text-xs text-[#8C7A6B]">{{ count($cart) }} items</span>
                </div>

                <div class="mt-4 space-y-3">
                    @forelse($cart as $line)
                        <div class="p-3.5 bg-[#F4EFEB] rounded-2xl border border-[#E6DDD4] flex items-center justify-between gap-3">
                            <div class="flex-1">
                                <h4 class="font-bold text-xs text-[#2B231F]">{{ $line['name'] }}</h4>
                                <p class="text-[10px] text-[#8C7A6B]">
                                    Size: {{ $line['customizations']['size'] ?? 'Standard' }}
                                    @if(!empty($line['customizations']['add_ons']))
                                        • +{{ count($line['customizations']['add_ons']) }} add-ons
                                    @endif
                                </p>
                                <p class="font-bold text-xs text-[#5C4033] mt-1">₱{{ number_format($line['price'] * $line['quantity'], 2) }}</p>
                            </div>

                            <div class="flex items-center gap-2">
                                <div class="flex items-center bg-[#EFE8E1] rounded-full p-0.5">
                                    <button wire:click="updateCartQuantity('{{ $line['cart_id'] }}', -1)" class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center">-</button>
                                    <span class="w-6 text-center text-xs font-bold">{{ $line['quantity'] }}</span>
                                    <button wire:click="updateCartQuantity('{{ $line['cart_id'] }}', 1)" class="w-6 h-6 rounded-full bg-[#FDFBF7] text-[#5C4033] font-bold text-xs flex items-center justify-center">+</button>
                                </div>
                                <button wire:click="removeCartItem('{{ $line['cart_id'] }}')" class="p-2 text-[#DC2626] hover:bg-red-50 rounded-full">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>
                    @empty
                        <div class="py-16 text-center text-xs text-[#8C7A6B]">
                            Your cart is empty. Add delicious items from the catalog!
                        </div>
                    @endforelse
                </div>
            </div>

            @if(count($cart) > 0)
                <div class="pt-4 border-t border-[#EFE8E1] space-y-3">
                    <div class="flex justify-between text-xs text-[#736357]">
                        <span>Subtotal</span>
                        <span>₱{{ number_format($this->subtotal, 2) }}</span>
                    </div>
                    <div class="flex justify-between font-bold text-sm text-[#2B231F]">
                        <span>Total Due</span>
                        <span class="text-[#5C4033]">₱{{ number_format($this->subtotal, 2) }}</span>
                    </div>
                    <button wire:click="proceedToPayment" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-bold rounded-full text-xs shadow-md hover:bg-[#4A3328] transition">
                        Proceed to Checkout
                    </button>
                </div>
            @endif
        </div>

    {{-- SCREEN 7: PAYMENT VIEW --}}
    @elseif($currentScreen === 7)
        <div class="min-h-screen p-5 flex flex-col justify-between">
            <div>
                <button wire:click="$set('currentScreen', 6)" class="text-[#8C7A6B] hover:text-[#5C4033] text-xs flex items-center gap-1 font-semibold mb-5">
                    ← Back to Cart
                </button>
                <h2 class="font-display text-xl font-bold text-[#2B231F]">Select Payment Option</h2>
                <p class="text-xs text-[#8C7A6B] mt-1">Order total: <strong class="text-[#5C4033]">₱{{ number_format($this->subtotal, 2) }}</strong></p>

                <div class="mt-6 space-y-4">
                    {{-- Cash Option (Green badge) --}}
                    <div wire:click="$set('paymentMethod', 'cash')"
                         class="p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 {{ $paymentMethod === 'cash' ? 'border-[#5C4033] bg-[#F4EFEB]' : 'border-[#E6DDD4] bg-[#FDFBF7]' }}">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 {{ $paymentMethod === 'cash' ? 'border-[#5C4033]' : 'border-[#A6978A]' }}">
                            @if($paymentMethod === 'cash') <div class="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div> @endif
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-xs text-[#2B231F]">Cash at Counter</h4>
                                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cash</span>
                            </div>
                            <p class="text-[11px] text-[#736357] mt-1">Pay with physical cash at the barista counter. Order is verified once payment is received.</p>
                        </div>
                    </div>

                    {{-- GCash / Online Option (Blue badge) --}}
                    <div wire:click="$set('paymentMethod', 'online')"
                         class="p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 {{ $paymentMethod === 'online' ? 'border-[#5C4033] bg-[#F4EFEB]' : 'border-[#E6DDD4] bg-[#FDFBF7]' }}">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 {{ $paymentMethod === 'online' ? 'border-[#5C4033]' : 'border-[#A6978A]' }}">
                            @if($paymentMethod === 'online') <div class="w-2.5 h-2.5 rounded-full bg-[#5C4033]"></div> @endif
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-xs text-[#2B231F]">GCash E-Wallet</h4>
                                <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">GCash</span>
                            </div>
                            <p class="text-[11px] text-[#736357] mt-1">Instant electronic payment via GCash QR code. Directly advances order to preparing.</p>

                            @if($paymentMethod === 'online')
                                <div class="mt-3 p-3 bg-[#FDFBF7] rounded-xl border border-[#E6DDD4] text-center">
                                    <p class="text-[11px] font-semibold text-[#5C4033]">Scan Merchant QR</p>
                                    <div class="w-28 h-28 bg-white mx-auto my-2 border rounded-lg flex items-center justify-center p-1">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GCASH-CAFEPITA-ORDER" alt="GCash QR" class="w-full h-full">
                                    </div>
                                    <input type="text" wire:model.defer="onlineRefNumber" placeholder="Enter GCash Ref No. (e.g. 10293847)"
                                           class="w-full px-3 py-2 text-[11px] bg-[#F4EFEB] border rounded-lg focus:outline-none">
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <button wire:click="submitOrder" class="w-full py-4 bg-[#5C4033] text-[#FDFBF7] font-bold rounded-full text-xs shadow-lg hover:bg-[#4A3328] transition">
                Confirm & Place Order
            </button>
        </div>
    @endif
</div>`,
  },
  {
    path: 'resources/views/livewire/order-tracker.blade.php',
    category: 'Blade View',
    description: 'Screen 8: Live Progress Pipeline with wire:poll.3s, step indicators, and cancellation modal',
    code: `{{-- resources/views/livewire/order-tracker.blade.php --}}
<div wire:poll.3s="loadOrder" class="min-h-screen bg-[#FDFBF7] text-[#2B231F] font-sans antialiased max-w-md mx-auto p-5 pb-12 shadow-2xl border-x border-[#EFE8E1]">

    {{-- Order Placed Banner --}}
    <div class="text-center py-6 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] shadow-sm">
        <div class="w-14 h-14 mx-auto rounded-full bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="font-display text-2xl font-bold text-[#2B231F] mt-3">Order Placed!</h2>
        <p class="text-xs text-[#8C7A6B] mt-0.5">Tracking Token:</p>
        <p class="font-mono text-base font-extrabold text-[#5C4033] tracking-wider">{{ $order->tracking_token }}</p>
    </div>

    {{-- Customer & Order Specs --}}
    <div class="mt-4 p-4 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] flex justify-between text-xs">
        <div>
            <p class="text-[#8C7A6B]">Customer</p>
            <p class="font-bold text-[#2B231F]">{{ $order->customer_name }}</p>
        </div>
        <div>
            <p class="text-[#8C7A6B]">Order Type</p>
            <p class="font-bold text-[#2B231F] uppercase">{{ $order->order_type }} {{ $order->table ? "(T-{$order->table->table_number})" : '' }}</p>
        </div>
        <div>
            <p class="text-[#8C7A6B]">Payment</p>
            <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold {{ $order->payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' }}">
                {{ strtoupper($order->payment_status) }}
            </span>
        </div>
    </div>

    {{-- VERTICAL PROGRESS PIPELINE (Screen 8) --}}
    <div class="mt-6 p-5 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4]">
        <h3 class="text-xs uppercase tracking-wider font-bold text-[#5C4033] mb-4">Live Kitchen Status</h3>

        <div class="space-y-6 relative pl-6 border-l-2 border-[#D9CDC1] ml-3">
            {{-- Step 1: Order Placed --}}
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-[#5C4033] bg-[#5C4033] text-white flex items-center justify-center text-[10px]">
                    ✓
                </div>
                <div>
                    <h4 class="font-bold text-xs text-[#2B231F]">Order Placed</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Received by Café Pepita POS system.</p>
                </div>
            </div>

            {{-- Step 2: Preparing --}}
            @php
                $isPreparing = in_array($order->order_status, ['preparing', 'ready', 'completed']);
                $isActivePreparing = $order->order_status === 'preparing';
            @endphp
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 {{ $isPreparing ? 'border-[#5C4033] bg-[#5C4033] text-white' : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]' }} flex items-center justify-center text-[10px] {{ $isActivePreparing ? 'animate-pulse ring-4 ring-[#5C4033]/20' : '' }}">
                    2
                </div>
                <div>
                    <h4 class="font-bold text-xs {{ $isPreparing ? 'text-[#2B231F]' : 'text-[#8C7A6B]' }}">Preparing</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Baristas are brewing and assembling your order.</p>
                </div>
            </div>

            {{-- Step 3: Ready for Pickup --}}
            @php
                $isReady = in_array($order->order_status, ['ready', 'completed']);
            @endphp
            <div class="relative">
                <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 {{ $isReady ? 'border-[#5C4033] bg-[#5C4033] text-white' : 'border-[#D9CDC1] bg-[#FDFBF7] text-[#8C7A6B]' }} flex items-center justify-center text-[10px]">
                    3
                </div>
                <div>
                    <h4 class="font-bold text-xs {{ $isReady ? 'text-[#2B231F]' : 'text-[#8C7A6B]' }}">Ready for Pickup</h4>
                    <p class="text-[10px] text-[#8C7A6B]">Your order is ready at the claim counter!</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Order Summary Lines --}}
    <div class="mt-6 p-4 bg-[#FDFBF7] rounded-2xl border border-[#EFE8E1] space-y-2">
        <h4 class="text-xs uppercase tracking-wider font-bold text-[#5C4033] mb-2">Order Items</h4>
        @foreach($order->items as $item)
            <div class="flex justify-between text-xs py-1 border-b border-[#F4EFEB] last:border-none">
                <div>
                    <span class="font-bold">{{ $item->quantity }}x</span> {{ $item->menuItem->name ?? 'Custom Item' }}
                </div>
                <span class="font-bold text-[#5C4033]">₱{{ number_format($item->price * $item->quantity, 2) }}</span>
            </div>
        @endforeach
        <div class="pt-2 flex justify-between font-bold text-xs text-[#2B231F]">
            <span>Total</span>
            <span class="text-[#5C4033]">₱{{ number_format($order->total_amount, 2) }}</span>
        </div>
    </div>

    {{-- Cancellation Action (Only allowed while status is 'pending') --}}
    <div class="mt-6">
        @if($order->order_status === 'pending')
            @if($order->cancellation_requested)
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs text-amber-800">
                    Cancellation request submitted. Awaiting staff confirmation.
                </div>
            @else
                <button wire:click="$set('showCancelModal', true)" class="w-full py-3 bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold text-xs rounded-full border border-red-200 transition">
                    Cancel Order
                </button>
            @endif
        @else
            <p class="text-center text-[11px] text-[#8C7A6B]">
                Order is currently in preparation and can no longer be modified.
            </p>
        @endif
    </div>

    {{-- Cancellation Modal --}}
    @if($showCancelModal)
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5">
            <div class="bg-[#FDFBF7] w-full max-w-sm rounded-3xl p-5 border border-[#EFE8E1] shadow-2xl">
                <h3 class="font-display text-base font-bold text-[#2B231F]">Cancel Order</h3>
                <p class="text-xs text-[#8C7A6B] mt-1">Are you sure you want to cancel order #{{ $order->tracking_token }}?</p>
                <textarea wire:model.defer="cancelReason" placeholder="Reason for cancellation..." 
                          class="w-full mt-3 p-3 bg-[#F4EFEB] border rounded-xl text-xs text-[#2B231F] focus:outline-none"></textarea>
                <div class="mt-4 flex gap-2">
                    <button wire:click="$set('showCancelModal', false)" class="flex-1 py-2.5 bg-[#EFE8E1] text-[#736357] font-bold text-xs rounded-full">Keep Order</button>
                    <button wire:click="requestCancellation" class="flex-1 py-2.5 bg-[#DC2626] text-white font-bold text-xs rounded-full">Confirm Cancel</button>
                </div>
            </div>
        </div>
    @endif
</div>`,
  },

  // ==================== DEPLOYMENT ====================
  {
    path: 'nixpacks.toml',
    category: 'Deployment',
    description: 'Railway Nixpacks build specification piping logs to stdout with dynamic MySQL variables',
    code: `# nixpacks.toml for Railway Laravel 11 Deployment
[phases.setup]
nixPkgs = ["php83", "php83Extensions.pdo_mysql", "php83Extensions.mbstring", "php83Extensions.bcmath", "php83Extensions.tokenizer", "php83Extensions.xml", "php83Extensions.curl", "composer", "nodejs_20", "nginx"]

[phases.install]
cmds = [
    "composer install --no-dev --optimize-autoloader --no-interaction",
    "npm ci",
    "npm run build"
]

[phases.build]
cmds = [
    "php artisan config:cache",
    "php artisan route:cache",
    "php artisan view:cache",
    "php artisan storage:link"
]

[start]
cmd = "php artisan migrate --force && php artisan db:seed --force && nginx -g 'daemon off;' & php-fpm -F -O"
`,
  },
  {
    path: '.env.railway.example',
    category: 'Deployment',
    description: 'Dynamic environment variables linking Railway MySQL automatically to Laravel',
    code: `APP_NAME="Café Pepita"
APP_ENV=production
APP_KEY=base64:GENERATE_VIA_RAILWAY_OR_ARTISAN
APP_DEBUG=false
APP_URL=\${{RAILWAY_STATIC_URL}}

LOG_CHANNEL=stderr
LOG_LEVEL=info

# Railway Dynamic MySQL Binding
DB_CONNECTION=mysql
DB_HOST=\${{MYSQLHOST}}
DB_PORT=\${{MYSQLPORT}}
DB_DATABASE=\${{MYSQLDATABASE}}
DB_USERNAME=\${{MYSQLUSER}}
DB_PASSWORD=\${{MYSQLPASSWORD}}

BROADCAST_DRIVER=pusher
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Pusher / Laravel Reverb WebSockets
PUSHER_APP_ID=\${{PUSHER_APP_ID}}
PUSHER_APP_KEY=\${{PUSHER_APP_KEY}}
PUSHER_APP_SECRET=\${{PUSHER_APP_SECRET}}
PUSHER_HOST=\${{PUSHER_HOST}}
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=ap1

VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"
`,
  },

  // ==================== SPATIE RBAC & SECURITY ====================
  {
    path: 'database/migrations/2025_01_01_000003_create_permission_tables.php',
    category: 'Security & RBAC',
    description: 'Spatie Laravel Permission migration establishing roles, permissions, model_has_roles, and model_has_permissions',
    code: `<?php

use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Database\\Migrations\\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $pivotRole = $columnNames['role_pivot_key'] ?? 'role_id';
        $pivotPermission = $columnNames['permission_pivot_key'] ?? 'permission_id';

        Schema::create($tableNames['permissions'], function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create($tableNames['roles'], function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create($tableNames['model_has_permissions'], function (Blueprint $table) use ($tableNames, $columnNames, $pivotPermission) {
            $table->unsignedBigInteger($pivotPermission);
            $table->string('model_type');
            $table->unsignedBigInteger($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_permissions_model_id_model_type_index');

            $table->foreign($pivotPermission)->references('id')->on($tableNames['permissions'])->onDelete('cascade');
            $table->primary([$pivotPermission, $columnNames['model_morph_key'], 'model_type'], 'model_has_permissions_permission_model_type_primary');
        });

        Schema::create($tableNames['model_has_roles'], function (Blueprint $table) use ($tableNames, $columnNames, $pivotRole) {
            $table->unsignedBigInteger($pivotRole);
            $table->string('model_type');
            $table->unsignedBigInteger($columnNames['model_morph_key']);
            $table->index([$columnNames['model_morph_key'], 'model_type'], 'model_has_roles_model_id_model_type_index');

            $table->foreign($pivotRole)->references('id')->on($tableNames['roles'])->onDelete('cascade');
            $table->primary([$pivotRole, $columnNames['model_morph_key'], 'model_type'], 'model_has_roles_role_model_type_primary');
        });

        Schema::create($tableNames['role_has_permissions'], function (Blueprint $table) use ($tableNames, $pivotRole, $pivotPermission) {
            $table->unsignedBigInteger($pivotPermission);
            $table->unsignedBigInteger($pivotRole);

            $table->foreign($pivotPermission)->references('id')->on($tableNames['permissions'])->onDelete('cascade');
            $table->foreign($pivotRole)->references('id')->on($tableNames['roles'])->onDelete('cascade');
            $table->primary([$pivotPermission, $pivotRole], 'role_has_permissions_permission_id_role_id_primary');
        });

        app('cache')->forget(config('permission.cache.key'));
    }

    public function down(): void
    {
        $tableNames = config('permission.table_names');
        Schema::dropIfExists($tableNames['role_has_permissions']);
        Schema::dropIfExists($tableNames['model_has_roles']);
        Schema::dropIfExists($tableNames['model_has_permissions']);
        Schema::dropIfExists($tableNames['roles']);
        Schema::dropIfExists($tableNames['permissions']);
    }
};`,
  },
  {
    path: 'database/seeders/RolesAndPermissionsSeeder.php',
    category: 'Security & RBAC',
    description: 'Seeds Spatie Roles (admin, staff, customer) and binds granular cafe operations permissions',
    code: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;
use Spatie\\Permission\\PermissionRegistrar;
use App\\Models\\User;
use Illuminate\\Support\\Facades\\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Define Granular Permissions
        $permissions = [
            'view-menu',
            'place-order',
            'view-order-tracker',
            'view-kds',
            'confirm-cash-payment',
            'update-order-status',
            'view-financial-analytics',
            'manage-menu-items',
            'manage-inventory-stock',
            'manage-staff-accounts',
            'manage-roles-permissions',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        // 3. Create Roles & Sync Permissions
        $customerRole = Role::findOrCreate('customer', 'web');
        $customerRole->syncPermissions(['view-menu', 'place-order', 'view-order-tracker']);

        $staffRole = Role::findOrCreate('staff', 'web');
        $staffRole->syncPermissions([
            'view-menu', 'place-order', 'view-order-tracker',
            'view-kds', 'confirm-cash-payment', 'update-order-status',
        ]);

        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions(Permission::all());

        // 4. Create Initial Authenticated Users
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@cafepita.ph'],
            ['name' => 'Maria Santos (Admin)', 'password' => Hash::make('PepitaAdmin2025!'), 'is_active' => true]
        );
        $adminUser->syncRoles(['admin']);

        $baristaUser = User::firstOrCreate(
            ['email' => 'barista@cafepita.ph'],
            ['name' => 'Juan Dela Cruz (Barista)', 'password' => Hash::make('PepitaBarista2025!'), 'is_active' => true]
        );
        $baristaUser->syncRoles(['staff']);

        $guestCustomer = User::firstOrCreate(
            ['email' => 'customer@cafepita.ph'],
            ['name' => 'Walk-in Guest Customer', 'password' => Hash::make('Customer123!'), 'is_active' => true]
        );
        $guestCustomer->syncRoles(['customer']);
    }
}`,
  },
  {
    path: 'app/Models/User.php',
    category: 'Security & RBAC',
    description: 'User model integrating Spatie HasRoles trait, active status checks, and role helpers',
    code: `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Spatie\\Permission\\Traits\\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function canAccessKds(): bool
    {
        return $this->hasAnyRole(['staff', 'admin']) && $this->is_active;
    }
}`,
  },
  {
    path: 'bootstrap/app.php',
    category: 'Routes & Config',
    description: 'Laravel 11 application bootstrap registering Spatie middleware aliases and channels',
    code: `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;
use Spatie\\Permission\\Middleware\\RoleMiddleware;
use Spatie\\Permission\\Middleware\\PermissionMiddleware;
use Spatie\\Permission\\Middleware\\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\\Spatie\\Permission\\Exceptions\\UnauthorizedException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'forbidden',
                    'message' => 'User does not have required permissions.',
                    'required' => $e->getRequiredRoles() ?: $e->getRequiredPermissions(),
                ], 403);
            }
            return response()->view('errors.403', ['exception' => $e], 403);
        });
    })->create();`,
  },
  {
    path: 'routes/web.php',
    category: 'Routes & Config',
    description: 'Web route definitions protected by Spatie middleware role:admin, role:staff, and customer access',
    code: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Livewire\\CustomerMenuCatalog;
use App\\Livewire\\CustomerCart;
use App\\Livewire\\CustomerOrderTracker;
use App\\Livewire\\StaffPosDashboard;
use App\\Livewire\\AdminAnalytics;
use App\\Livewire\\AdminStaffManagement;
use App\\Livewire\\AdminProductCatalog;
use App\\Livewire\\AdminInventoryLogs;

// Public & Customer Routes
Route::get('/', fn () => view('customer.splash'))->name('home');
Route::get('/scan/{qr_token}', [App\\Http\\Controllers\\QrRedirectController::class, 'handle'])->name('qr.scan');

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
});`,
  },
  {
    path: 'app/Events/OrderPlaced.php',
    category: 'Events & Echo',
    description: 'Broadcast event triggered when order is checked out, streaming payload to staff private channel',
    code: `<?php

namespace App\\Events;

use App\\Models\\Order;
use Illuminate\\Broadcasting\\InteractsWithSockets;
use Illuminate\\Broadcasting\\PrivateChannel;
use Illuminate\\Contracts\\Broadcasting\\ShouldBroadcastNow;
use Illuminate\\Foundation\\Events\\Dispatchable;
use Illuminate\\Queue\\SerializesModels;

class OrderPlaced implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['items.menuItem', 'table']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('staff.orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderPlaced';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'tracking_token' => $this->order->tracking_token,
            'order_type' => $this->order->order_type,
            'table_number' => $this->order->table ? $this->order->table->table_number : null,
            'customer_name' => $this->order->customer_name,
            'payment_method' => $this->order->payment_method,
            'payment_status' => $this->order->payment_status,
            'order_status' => $this->order->order_status,
            'total_amount' => (float) $this->order->total_amount,
            'items_count' => $this->order->items->count(),
            'items' => $this->order->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->menuItem ? $item->menuItem->name : 'Item',
                'quantity' => $item->quantity,
                'size' => $item->size,
                'temperature' => $item->temperature,
                'sugar_level' => $item->sugar_level,
                'customizations' => $item->customizations,
            ]),
            'created_at' => $this->order->created_at->toIso8601String(),
        ];
    }
}`,
  },
  {
    path: 'routes/channels.php',
    category: 'Events & Echo',
    description: 'Broadcast channel authorization restricting private-staff.orders to staff and admin roles',
    code: `<?php

use Illuminate\\Support\\Facades\\Broadcast;

Broadcast::channel('staff.orders', function ($user) {
    return $user->hasAnyRole(['staff', 'admin']) && $user->is_active;
});

Broadcast::channel('orders.{trackingToken}', function ($user = null, $trackingToken) {
    return true;
});`,
  },
  {
    path: 'config/broadcasting.php',
    category: 'Events & Echo',
    description: 'Broadcasting configuration supporting Pusher, Laravel Reverb, and log drivers',
    code: `<?php

return [
    'default' => env('BROADCAST_DRIVER', 'pusher'),
    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
                'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'ap1').'.pusher.com',
                'port' => env('PUSHER_PORT', 443),
                'scheme' => env('PUSHER_SCHEME', 'https'),
                'encrypted' => true,
                'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
            ],
        ],
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
        ],
        'log' => [
            'driver' => 'log',
        ],
    ],
];`,
  },
  {
    path: 'resources/js/echo.js',
    category: 'Events & Echo',
    description: 'Frontend Laravel Echo and Pusher-JS initialization script',
    code: `import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
    wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : \`ws-\${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com\`,
    wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
    wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});`,
  },
  {
    path: 'app/Livewire/StaffPosDashboard.php',
    category: 'Livewire',
    description: 'Livewire v3 Staff KDS component listening for OrderPlaced Echo events with instant UI & sound updates',
    code: `<?php

namespace App\\Livewire;

use Livewire\\Component;
use Livewire\\Attributes\\On;
use App\\Models\\Order;
use App\\Services\\InventoryDeductionService;
use Illuminate\\Support\\Facades\\DB;

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
}`,
  },
  {
    path: 'resources/views/livewire/staff-pos-dashboard.blade.php',
    category: 'Blade View',
    description: 'Blade view for Staff KDS with Web Audio chime listener and real-time incoming ticket alert',
    code: `<div class="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16"
     x-data="{
        playDing() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } catch(e) { console.warn('AudioContext notice:', e); }
        }
     }"
     @play-order-chime.window="playDing()">

    <!-- Real-Time Echo Toast Alert -->
    @if ($latestEchoBroadcast)
        <div x-data="{ show: true }"
             x-show="show"
             x-init="setTimeout(() => show = false, 8000)"
             class="fixed top-20 right-6 z-50 bg-[#2B231F] text-[#FDFBF7] border border-[#3E332D] rounded-2xl p-4 shadow-2xl max-w-sm">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="font-bold text-xs text-[#FAEDCD]">New Order Broadcast!</span>
                </div>
                <button @click="show = false" class="text-[#8C7A6B] hover:text-white">&times;</button>
            </div>
            <div class="mt-2 text-xs">
                <div class="font-mono font-bold text-base text-white">#{{ $latestEchoBroadcast['tracking_token'] }}</div>
                <p class="text-[#D4C5B9] mt-0.5">{{ $latestEchoBroadcast['customer_name'] }} • ₱{{ number_format($latestEchoBroadcast['total_amount'], 2) }}</p>
            </div>
        </div>
    @endif

    <!-- Orders Grid with live updates -->
    <div class="max-w-7xl mx-auto px-6 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @foreach ($orders as $order)
                <div class="bg-white border rounded-3xl p-5 shadow-xs">
                    <div class="flex justify-between items-center border-b pb-2">
                        <span class="font-mono font-bold text-[#5C4033]">#{{ $order->tracking_token }}</span>
                        <span class="text-xs uppercase px-2 py-0.5 rounded-full bg-[#EFE8E1]">{{ $order->order_status }}</span>
                    </div>
                    <p class="font-bold text-xs mt-2">{{ $order->customer_name }}</p>
                </div>
            @endforeach
        </div>
    </div>
</div>`,
  },
  {
    path: 'app/Http/Requests/StoreDeliveryOrderRequest.php',
    category: 'FormRequest',
    description: 'Laravel 13 Form Request validating Philippine mobile contact number and GCash proof of payment image upload',
    code: `<?php

namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Validation\\Rule;

class StoreDeliveryOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \\Illuminate\\Contracts\\Validation\\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'min:2', 'max:100'],
            'delivery_address' => ['required', 'string', 'min:5', 'max:255'],
            'city_region' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:10'],
            // Strict Philippine Mobile Number: Exactly 11 digits starting with 09
            'contact_number' => [
                'required',
                'string',
                'regex:/^09\\d{9}$/',
            ],
            'driver_notes' => ['nullable', 'string', 'max:300'],
            'payment_method' => ['required', Rule::in(['cash', 'online'])],
            
            // GCash Proof of Payment: Mandatory if payment_method is online, image <= 5MB
            'gcash_receipt' => [
                'required_if:payment_method,online',
                'nullable',
                'file',
                'image',
                'mimes:png,jpg,jpeg,webp',
                'max:5120', // 5MB limit in kilobytes
            ],

            // Cart Items Array
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'items.*.customizations' => ['nullable', 'array'],
        ];
    }

    /**
     * Custom error messages for client feedback.
     */
    public function messages(): array
    {
        return [
            'contact_number.required' => 'Customer contact number is required for delivery coordination.',
            'contact_number.regex' => 'Please enter a valid 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).',
            'gcash_receipt.required_if' => 'Proof of Payment image upload is mandatory for GCash transactions.',
            'gcash_receipt.image' => 'The proof of payment must be a valid image file.',
            'gcash_receipt.mimes' => 'The proof of payment must be in PNG, JPG, JPEG, or WEBP format.',
            'gcash_receipt.max' => 'The proof of payment image cannot exceed 5MB.',
        ];
    }
}`,
  },
  {
    path: 'app/Http/Controllers/Api/OrderApiController.php',
    category: 'Controller',
    description: 'Laravel 13 API Controller processing multipart delivery orders, receipt storage, and inventory locks',
    code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\StoreDeliveryOrderRequest;
use App\\Models\\Order;
use App\\Models\\OrderItem;
use App\\Models\\MenuItem;
use App\\Models\\AddOn;
use App\\Events\\OrderPlaced;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Support\\Facades\\DB;
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Str;

class OrderApiController extends Controller
{
    /**
     * Store a newly placed order via REST API / multipart form-data.
     */
    public function store(StoreDeliveryOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = DB::transaction(function () use ($request, $validated) {
            $receiptPath = null;

            // 1. Process uploaded GCash Proof of Payment image if present
            if ($request->hasFile('gcash_receipt') && $request->file('gcash_receipt')->isValid()) {
                // Stores in storage/app/public/receipts
                $storedFile = $request->file('gcash_receipt')->store('receipts', 'public');
                $receiptPath = Storage::url($storedFile);
            }

            // 2. Calculate verified total amount & verify stock
            $totalAmount = 0.00;
            $itemsToCreate = [];

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::where('id', $itemData['item_id'])->lockForUpdate()->firstOrFail();
                
                $unitPrice = (float) $menuItem->price;
                $customizations = $itemData['customizations'] ?? [];

                if (!empty($customizations['size']) && $customizations['size'] === '22oz') {
                    $unitPrice += 20.00;
                }

                if (!empty($customizations['add_ons'])) {
                    $addOnIds = collect($customizations['add_ons'])->pluck('id')->filter();
                    if ($addOnIds->isNotEmpty()) {
                        $unitPrice += (float) AddOn::whereIn('id', $addOnIds)->sum('price');
                    }
                }

                $totalAmount += $unitPrice * $itemData['quantity'];
                $itemsToCreate[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'price' => $unitPrice,
                    'customizations' => $customizations,
                ];
            }

            // 3. Create Order Record with delivery details & receipt
            // Mandatory Verification Workflow: all orders begin in Pending Verification
            $order = Order::create([
                'tracking_token' => strtoupper(Str::random(8)),
                'customer_name' => $validated['customer_name'],
                'order_type' => 'take-out', // Delivery/take-out
                'total_amount' => $totalAmount,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'unpaid',
                'order_status' => 'pending', // Starts in pending verification until Staff approves
                'contact_number' => $validated['contact_number'],
                'delivery_address' => "{$validated['delivery_address']}, {$validated['city_region']} {$validated['postal_code']}",
                'driver_notes' => $validated['driver_notes'] ?? null,
                'gcash_receipt_path' => $receiptPath,
            ]);

            // 4. Create Order Items
            foreach ($itemsToCreate as $itemSpec) {
                $order->items()->create($itemSpec);
            }

            return $order;
        });

        // 5. Broadcast Real-Time Order Event to Kitchen Display System (KDS)
        broadcast(new OrderPlaced($order->fresh(['items.menuItem'])))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully and transmitted to kitchen for payment verification.',
            'order' => [
                'id' => $order->id,
                'tracking_token' => $order->tracking_token,
                'status' => $order->order_status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'gcash_receipt_path' => $order->gcash_receipt_path,
                'total_amount' => $order->total_amount,
            ],
        ], 201);
    }
}
`,
  },
  {
    path: 'app/Http/Controllers/Api/StaffOrderVerificationController.php',
    category: 'Controller',
    description: 'Laravel 13 API Controller managing mandatory payment verification (Cash/GCash receipt) and order approval/rejection',
    code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Order;
use App\\Events\\OrderStatusUpdated;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\DB;

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
`,
  },
  {
    path: 'app/Http/Controllers/Api/AdminSalesReportController.php',
    category: 'Controller',
    description: 'Admin endpoint GET /api/admin/reports/export with start_date and end_date filtering for streaming CSV sales exports',
    code: `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Order;
use Illuminate\\Http\\Request;
use Symfony\\Component\\HttpFoundation\\StreamedResponse;

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
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
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
`,
  },
];
