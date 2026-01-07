<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnergyData extends Model
{
    // The table name is automatically guessed as 'energy_data' from class name
    // So you can skip $table unless you want to be explicit:
    // protected $table = 'energy_data';

    // The attributes that are mass assignable (optional for now)
    protected $fillable = [
        'floor',
        'date',
        'hour',
        'minute',
        'second',
        'timestamp',
        'voltage_v',
        'current_a',
        'power_w',
        'energy_wh',
    ];

    // If you want timestamps (created_at/updated_at) to work:
    public $timestamps = true;
}
