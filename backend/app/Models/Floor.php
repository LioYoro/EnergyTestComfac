<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    protected $fillable = [
        'building_id',
        'floor_number',
        'name',
        'area',
        'unit_count',
    ];

    /**
     * Get the building that owns this floor.
     */
    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    /**
     * Get the units for this floor.
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}

