<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EnergyDataController;

Route::get('/energy/summary', [EnergyDataController::class, 'summary']);
Route::get('/energy/dashboard/summary', [EnergyDataController::class, 'getSummary']);
Route::get('/energy/dashboard/hourly', [EnergyDataController::class, 'getHourlyData']);
Route::get('/energy/dashboard/minute', [EnergyDataController::class, 'getMinuteData']);
Route::get('/energy/dashboard/dates', [EnergyDataController::class, 'getAvailableDates']);
Route::get('/energy/dashboard/weekly-peak-hours', [EnergyDataController::class, 'getWeeklyPeakHours']);
Route::get('/energy/dashboard/floor-analytics', [EnergyDataController::class, 'getFloorAnalytics']);
Route::get('/test', fn() => response()->json(['message' => 'API works!']));