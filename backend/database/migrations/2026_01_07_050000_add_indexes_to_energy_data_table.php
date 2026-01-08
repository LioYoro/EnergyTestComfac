<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('energy_data', function (Blueprint $table) {
            // Add indexes for frequently queried columns
            // These will dramatically speed up queries on 2M+ records
            $table->index('date', 'idx_energy_data_date');
            $table->index('floor', 'idx_energy_data_floor');
            $table->index('hour', 'idx_energy_data_hour');
            
            // Composite index for common query pattern: date + floor
            $table->index(['date', 'floor'], 'idx_energy_data_date_floor');
            
            // Composite index for date + hour (for hourly aggregations)
            $table->index(['date', 'hour'], 'idx_energy_data_date_hour');
            
            // Composite index for floor + date + hour (most common query pattern)
            $table->index(['floor', 'date', 'hour'], 'idx_energy_data_floor_date_hour');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('energy_data', function (Blueprint $table) {
            $table->dropIndex('idx_energy_data_date');
            $table->dropIndex('idx_energy_data_floor');
            $table->dropIndex('idx_energy_data_hour');
            $table->dropIndex('idx_energy_data_date_floor');
            $table->dropIndex('idx_energy_data_date_hour');
            $table->dropIndex('idx_energy_data_floor_date_hour');
        });
    }
};

