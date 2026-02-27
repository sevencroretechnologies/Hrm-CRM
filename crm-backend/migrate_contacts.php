<?php

use App\Models\Customer;
use App\Models\Contact;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Migration of Customer Contacts to Customers..." . PHP_EOL;

$contacts = Contact::all();
$count = 0;

foreach ($contacts as $contact) {
    // Check if a customer already exists for this contact
    $exists = Customer::where('customer_contact_id', $contact->id)->exists();
    
    if (!$exists) {
        $name = $contact->company_name ?? $contact->full_name;
        
        try {
            Customer::create([
                'name' => $name,
                'customer_contact_id' => $contact->id,
                'email' => $contact->emails->first()?->email,
                'phone' => $contact->phones->first()?->phone_no,
                'address' => $contact->address,
                'customer_type' => 'Individual', // Default or derived
                'customer_group_id' => 1, // Default group if exists, or null
                'territory_id' => 1, // Default territory if exists, or null
            ]);
            echo "Created Customer for Contact: {$contact->full_name}" . PHP_EOL;
            $count++;
        } catch (\Exception $e) {
            echo "Failed to create customer for {$contact->full_name}: " . $e->getMessage() . PHP_EOL;
        }
    } else {
        echo "Customer already exists for Contact: {$contact->full_name}" . PHP_EOL;
    }
}

echo "Migration Completed. Created {$count} new Customers." . PHP_EOL;
