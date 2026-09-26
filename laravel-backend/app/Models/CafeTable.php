<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}