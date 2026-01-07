<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EnergyDataController;

Route::get('/energy/summary', [EnergyDataController::class, 'summary']);
