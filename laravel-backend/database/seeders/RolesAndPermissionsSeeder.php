<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
}