<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('staff.orders', function ($user) {
    return $user->hasAnyRole(['staff', 'admin']) && $user->is_active;
});

Broadcast::channel('orders.{trackingToken}', function ($user = null, $trackingToken) {
    return true;
});