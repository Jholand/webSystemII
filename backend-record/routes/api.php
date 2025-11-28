<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\PriestController;
use App\Http\Controllers\Api\ScheduleController;

Route::middleware('api')->group(function () {
    // Member routes
    Route::apiResource('members', MemberController::class);
    Route::post('members/{id}/toggle-status', [MemberController::class, 'toggleStatus']);
    
    // Priest routes
    Route::apiResource('priests', PriestController::class);
    
    // Schedule routes
    Route::apiResource('schedules', ScheduleController::class);
});
