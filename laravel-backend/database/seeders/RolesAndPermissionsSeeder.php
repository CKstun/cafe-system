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

        // 4. Create or Update Initial Authenticated Users (Staff & Admin only)
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@cafepita.com'],
            ['name' => 'Maria Santos (Admin)', 'password' => Hash::make('Admin2025'), 'is_active' => true]
        );
        $adminUser->syncRoles(['admin']);

        $baristaUser = User::updateOrCreate(
            ['email' => 'barista@cafepita.com'],
            ['name' => 'Juan Dela Cruz (Barista)', 'password' => Hash::make('Barista2025'), 'is_active' => true]
        );
        $baristaUser->syncRoles(['staff']);
    }
}