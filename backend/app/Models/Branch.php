<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'location',
        'type',
        'description',
    ];

    /**
     * Get the buildings for this branch.
     */
    public function buildings(): HasMany
    {
        return $this->hasMany(Building::class);
    }
}

