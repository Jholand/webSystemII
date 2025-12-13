<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequestType;
use Illuminate\Http\Request;

class ServiceRequestTypeController extends Controller
{
    public function index()
    {
        $types = ServiceRequestType::where('is_active', true)
                                   ->orderBy('display_order')
                                   ->get();
        
        return response()->json($types);
    }

    public function show($id)
    {
        $type = ServiceRequestType::findOrFail($id);
        return response()->json($type);
    }
}
