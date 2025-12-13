<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$requests = \App\Models\ServiceRequest::with('serviceRequestType')->take(10)->get();

echo "Total requests: " . $requests->count() . "\n\n";

foreach ($requests as $request) {
    echo "ID: {$request->id}\n";
    echo "Service Type: " . ($request->serviceRequestType->type_name ?? 'N/A') . "\n";
    echo "Service Fee: " . ($request->service_fee ?? 'NULL') . "\n";
    echo "Payment Status: " . ($request->payment_status ?? 'NULL') . "\n";
    echo "Category: " . ($request->category ?? 'NULL') . "\n";
    echo "---\n";
}
