<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Unit extends Model
{
    protected $fillable = [
        'floor_id',
        'name',
        'equipment_type',
        'consumption',
        'cost',
        'status',
        'peak_time',
    ];

    /**
     * Get the floor that owns this unit.
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }
}

