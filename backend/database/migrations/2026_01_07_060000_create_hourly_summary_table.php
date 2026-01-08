<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create a pre-aggregated table for instant peak hour lookups
     */
    public function up(): void
    {
        Schema::create('hourly_summary', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->tinyInteger('floor')->nullable();
            $table->tinyInteger('hour');
            $table->float('avg_current')->default(0);
            $table->float('total_energy')->default(0);
            $table->float('max_current')->default(0);
            $table->float('max_energy')->default(0);
            $table->integer('record_count')->default(0);
            $table->timestamps();
            
            // Composite unique index to prevent duplicates
            $table->unique(['date', 'floor', 'hour'], 'idx_hourly_summary_unique');
            
            // Indexes for fast lookups
            $table->index('date', 'idx_hourly_summary_date');
            $table->index(['date', 'floor'], 'idx_hourly_summary_date_floor');
            $table->index(['date', 'hour'], 'idx_hourly_summary_date_hour');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hourly_summary');
    }
};

