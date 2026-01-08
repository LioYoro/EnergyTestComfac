<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create a pre-aggregated table for instant summary lookups
     */
    public function up(): void
    {
        Schema::create('daily_summary', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->tinyInteger('floor')->nullable();
            $table->integer('total_records')->default(0);
            $table->float('avg_current')->default(0);
            $table->float('total_energy')->default(0);
            $table->integer('minute_count')->default(0);
            $table->float('avg_current_per_minute')->default(0);
            $table->integer('hour_count')->default(0);
            $table->float('avg_current_per_hour')->default(0);
            $table->timestamps();
            
            // Composite unique index
            $table->unique(['date', 'floor'], 'idx_daily_summary_unique');
            
            // Indexes for fast lookups
            $table->index('date', 'idx_daily_summary_date');
            $table->index(['date', 'floor'], 'idx_daily_summary_date_floor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_summary');
    }
};

