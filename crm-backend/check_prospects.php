<?php

use Illuminate\Support\Facades\Schema;

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$columns = Schema::getColumnListing('prospects');
echo "Table 'prospects' columns:\n";
print_r($columns);

$exists = Schema::hasTable('prospects');
echo "Table 'prospects' exists: " . ($exists ? 'Yes' : 'No') . "\n";
