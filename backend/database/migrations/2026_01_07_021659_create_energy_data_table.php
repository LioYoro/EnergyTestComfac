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
    Schema::create('energy_data', function (Blueprint $table) {
        $table->id();
        $table->date('date');
        $table->tinyInteger('hour');
        $table->tinyInteger('minute');
        $table->tinyInteger('second');
        $table->timestamp('timestamp');
        $table->float('voltage_v');
        $table->float('current_a');
        $table->float('power_w');
        $table->float('energy_wh');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('energy_data');
    }
};
