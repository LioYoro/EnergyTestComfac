<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends Model
{
    protected $fillable = [
        'branch_id',
        'name',
        'type',
        'total_floors',
        'area',
    ];

    /**
     * Get the branch that owns this building.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the floors for this building.
     */
    public function floors(): HasMany
    {
        return $this->hasMany(Floor::class);
    }
}

