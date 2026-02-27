<?php

use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$count = DB::table('customer_contacts')->count();
echo "Customer Contacts Count: $count\n";

$contacts = DB::table('customer_contacts')->limit(5)->get();
echo json_encode($contacts, JSON_PRETTY_PRINT);
