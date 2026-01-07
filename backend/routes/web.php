<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EnergyDataController;

Route::get('/', [EnergyDataController::class, 'dashboard'])->name('dashboard');
Route::get('/dashboard', [EnergyDataController::class, 'dashboard'])->name('dashboard.index');
