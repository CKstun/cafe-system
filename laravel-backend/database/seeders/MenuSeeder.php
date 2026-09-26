<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CafeTable;
use App\Models\MenuItem;
use App\Models\AddOn;

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
}