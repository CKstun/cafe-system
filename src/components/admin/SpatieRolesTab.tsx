import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import {
  ShieldCheck,
  KeyRound,
  UserCheck,
  CheckCircle2,
  Lock,
  Code2,
  Copy,
  Check,
  Sparkles,
  Info,
  Terminal,
} from 'lucide-react';
import { Role, Permission } from '../../types/cafe';

const ALL_PERMISSIONS: { id: Permission; label: string; category: string; description: string }[] = [
  {
    id: 'view-menu',
    label: 'View Menu & Prices',
    category: 'Customer Ordering',
    description: 'Browse the categorized menu, sizes, and customizations.',
  },
  {
    id: 'place-order',
    label: 'Submit Customer Orders',
    category: 'Customer Ordering',
    description: 'Checkout cart via Cash or GCash and generate tracking token.',
  },
  {
    id: 'view-order-tracker',
    label: 'Track Order Progress',
    category: 'Customer Ordering',
    description: 'Monitor live status changes from pending to completed.',
  },
  {
    id: 'view-kds',
    label: 'Access Kitchen POS (KDS)',
    category: 'Barista / Kitchen',
    description: 'View active incoming tickets on the kitchen display board.',
  },
  {
    id: 'confirm-cash-payment',
    label: 'Confirm Counter Cash Payments',
    category: 'Barista / Kitchen',
    description: 'Approve unpaid cash orders and automatically deduct atomic inventory.',
  },
  {
    id: 'update-order-status',
    label: 'Advance Kitchen Status',
    category: 'Barista / Kitchen',
    description: 'Advance tickets from Pending to Brewing, Ready, and Completed.',
  },
  {
    id: 'view-financial-analytics',
    label: 'View Financial & Sales Reports',
    category: 'Administration',
    description: 'Access revenue metrics, gross profit analysis, and sales charts.',
  },
  {
    id: 'manage-menu-items',
    label: 'Manage Menu Matrix & Prices',
    category: 'Administration',
    description: 'Create, edit, delete, and toggle item availability in catalog.',
  },
  {
    id: 'manage-inventory-stock',
    label: 'Audit & Restock Inventory',
    category: 'Administration',
    description: 'Perform batch restocks for syrup bottles, milk, cups, and beans.',
  },
  {
    id: 'manage-staff-accounts',
    label: 'Manage Staff User Accounts',
    category: 'Administration',
    description: 'Create and assign barista and manager accounts.',
  },
  {
    id: 'manage-roles-permissions',
    label: 'Configure Spatie RBAC Matrix',
    category: 'Administration',
    description: 'Assign and revoke permission capabilities across roles.',
  },
];

export const SpatieRolesTab: React.FC = () => {
  const {
    rolesList,
    toggleRolePermission,
    currentUserRole,
    setCurrentUserRole,
    staffUsers,
  } = useCafe();

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedRoleForCode, setSelectedRoleForCode] = useState<Role>('staff');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const getSpatieCodeSnippet = (role: Role) => {
    const roleDef = rolesList.find((r) => r.name === role);
    const perms = roleDef ? roleDef.permissions : [];

    return `// database/seeders/RolesAndPermissionsSeeder.php
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;

// Reset cached roles and permissions
app()[\\Spatie\\Permission\\PermissionRegistrar::class]->forgetCachedPermissions();

// Define ${role.toUpperCase()} Role
$role = Role::create(['name' => '${role}', 'guard_name' => 'web']);

// Synchronize Permissions
$role->syncPermissions([
${perms.map((p) => `    '${p}',`).join('\n')}
]);

// Assign to Authenticated User
$user = User::where('email', '${role === 'admin' ? 'admin@cafepita.ph' : 'barista@cafepita.ph'}')->first();
$user->assignRole('${role}');`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Spatie Overview */}
      <div className="bg-[#2B231F] text-[#FDFBF7] rounded-3xl p-6 border border-[#3E332D] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5C4033] text-[#FAEDCD] font-mono text-xs font-semibold">
                spatie/laravel-permission v6.16
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono text-[11px]">
                Guard: web
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#FDFBF7]">
              Role-Based Access Control (RBAC) Architecture
            </h2>
            <p className="text-xs text-[#D4C5B9] mt-1 max-w-2xl leading-relaxed">
              Café Pepita enforces strict role segmentation across Customer self-service, Barista Kitchen operations, and Administrator executive controls via Spatie Permission middleware.
            </p>
          </div>

          {/* Quick Active Persona Switcher */}
          <div className="bg-[#1F1A17] p-4 rounded-2xl border border-[#3E332D] shrink-0">
            <div className="text-[11px] uppercase font-bold text-[#A6978A] tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Simulate Current User Persona:</span>
            </div>
            <div className="flex items-center gap-2">
              {(['customer', 'staff', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCurrentUserRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition flex items-center gap-1.5 ${
                    currentUserRole === r
                      ? 'bg-[#5C4033] text-[#FDFBF7] shadow-sm ring-1 ring-[#D4A373]'
                      : 'bg-[#2B231F] text-[#A6978A] hover:text-white'
                  }`}
                >
                  {currentUserRole === r && <CheckCircle2 className="w-3 h-3 text-[#D4A373]" />}
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spatie Roles Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {rolesList.map((role) => {
          const isCurrent = currentUserRole === role.name;

          return (
            <div
              key={role.id}
              className={`bg-[#FDFBF7] rounded-3xl p-5 border-2 transition shadow-xs ${
                isCurrent
                  ? 'border-[#5C4033] ring-2 ring-[#5C4033]/20'
                  : 'border-[#EFE8E1]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Role ID #{role.id}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#2B231F] capitalize mt-0.5">
                    {role.display_name}
                  </h3>
                  <div className="text-xs font-mono text-[#5C4033] mt-0.5">
                    'name' =&gt; '{role.name}'
                  </div>
                </div>

                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5C4033] text-[#FDFBF7] text-[10px] font-bold">
                    Active Session
                  </span>
                )}
              </div>

              <p className="text-xs text-[#8C7A6B] mt-2.5 leading-relaxed">
                {role.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F4EFEB] flex items-center justify-between text-xs">
                <span className="text-[#8C7A6B]">Granted Permissions:</span>
                <span className="font-bold text-[#5C4033] font-mono">
                  {role.permissions.length} of {ALL_PERMISSIONS.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-[#FDFBF7] rounded-3xl border border-[#EFE8E1] p-6 shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#2B231F] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#5C4033]" />
              <span>Interactive Permission Matrix (Real-Time Authorization)</span>
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Toggle checkboxes to modify permissions per role dynamically. Changes immediately take effect on route access checks and navigation guards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(getSpatieCodeSnippet(selectedRoleForCode), 'matrix-copy')}
            className="px-3.5 py-1.5 rounded-xl bg-[#F4EFEB] hover:bg-[#E6DDD4] text-[#5C4033] text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            {copiedSnippet === 'matrix-copy' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Seeder Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Export Seeder PHP</span>
              </>
            )}
          </button>
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6DDD4] text-[11px] uppercase tracking-wider text-[#8C7A6B]">
                <th className="py-3 px-4 font-bold">Permission / Capability</th>
                <th className="py-3 px-3 font-bold">Category</th>
                <th className="py-3 px-3 text-center font-bold">
                  Customer
                  <span className="block text-[9px] font-mono lowercase text-[#A6978A]">role:customer</span>
                </th>
                <th className="py-3 px-3 text-center font-bold">
                  Staff (Barista)
                  <span className="block text-[9px] font-mono lowercase text-[#A6978A]">role:staff</span>
                </th>
                <th className="py-3 px-3 text-center font-bold">
                  Admin
                  <span className="block text-[9px] font-mono lowercase text-[#A6978A]">role:admin</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFEB]">
              {ALL_PERMISSIONS.map((perm) => {
                const customerHas = rolesList.find((r) => r.name === 'customer')?.permissions.includes(perm.id);
                const staffHas = rolesList.find((r) => r.name === 'staff')?.permissions.includes(perm.id);
                const adminHas = rolesList.find((r) => r.name === 'admin')?.permissions.includes(perm.id);

                return (
                  <tr key={perm.id} className="hover:bg-[#FAF6F0] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2B231F]">{perm.label}</div>
                      <div className="text-[11px] font-mono text-[#8C7A6B] mt-0.5">
                        '{perm.id}'
                      </div>
                      <div className="text-[11px] text-[#A6978A] mt-0.5">
                        {perm.description}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#EFE8E1] text-[#736357]">
                        {perm.category}
                      </span>
                    </td>

                    {/* Customer Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!customerHas}
                        onChange={() => toggleRolePermission('customer', perm.id)}
                        className="w-4 h-4 text-[#5C4033] rounded border-[#D9CDC1] focus:ring-[#5C4033] cursor-pointer"
                      />
                    </td>

                    {/* Staff Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!staffHas}
                        onChange={() => toggleRolePermission('staff', perm.id)}
                        className="w-4 h-4 text-[#5C4033] rounded border-[#D9CDC1] focus:ring-[#5C4033] cursor-pointer"
                      />
                    </td>

                    {/* Admin Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!adminHas}
                        onChange={() => toggleRolePermission('admin', perm.id)}
                        className="w-4 h-4 text-[#5C4033] rounded border-[#D9CDC1] focus:ring-[#5C4033] cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippet Preview Generator */}
      <div className="bg-[#1F1A17] text-[#D4C5B9] rounded-3xl p-6 border border-[#3E332D] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#D4A373]" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Spatie Seeder & Controller Code (Generated Live for Selection)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7A6B]">Inspect Role:</span>
            <select
              value={selectedRoleForCode}
              onChange={(e) => setSelectedRoleForCode(e.target.value as Role)}
              className="bg-[#2B231F] text-white border border-[#3E332D] rounded-lg px-2.5 py-1 text-xs font-mono capitalize focus:outline-none"
            >
              <option value="admin">admin</option>
              <option value="staff">staff</option>
              <option value="customer">customer</option>
            </select>

            <button
              type="button"
              onClick={() => copyToClipboard(getSpatieCodeSnippet(selectedRoleForCode), 'snippet-btn')}
              className="p-1.5 rounded-lg bg-[#2B231F] hover:bg-[#3E332D] text-[#D4C5B9] transition text-xs flex items-center gap-1"
            >
              {copiedSnippet === 'snippet-btn' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <pre className="font-mono text-xs text-[#E5DCD1] bg-[#14100E] p-4 rounded-2xl border border-[#2B231F] overflow-x-auto leading-relaxed">
          <code>{getSpatieCodeSnippet(selectedRoleForCode)}</code>
        </pre>
      </div>
    </div>
  );
};
