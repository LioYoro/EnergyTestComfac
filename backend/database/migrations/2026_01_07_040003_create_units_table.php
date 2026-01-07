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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('floor_id')->constrained('floors')->onDelete('cascade');
            $table->string('name');
            $table->string('equipment_type'); // HVAC, Lighting, IT Equipment, Appliances, etc.
            $table->decimal('consumption', 10, 2)->default(0); // kWh
            $table->decimal('cost', 10, 2)->default(0); // PHP
            $table->string('status')->default('operational'); // operational, maintenance, offline
            $table->string('peak_time')->nullable(); // e.g., "2:00 PM"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};

