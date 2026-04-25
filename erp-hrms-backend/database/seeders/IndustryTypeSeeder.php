<?php

namespace Database\Seeders;

use App\Models\IndustryType;
use Illuminate\Database\Seeder;

class IndustryTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $industryTypes = [
    ['name' => 'Information Technology'],
    ['name' => 'Software Development'],
    ['name' => 'IT Services'],
    ['name' => 'Cyber Security'],
    ['name' => 'Data Science'],

    ['name' => 'Healthcare'],
    ['name' => 'Finance'],
    ['name' => 'Banking'],
    ['name' => 'Insurance'],
    ['name' => 'Education'],
    ['name' => 'E-Commerce'],
    ['name' => 'Retail'],
    ['name' => 'Manufacturing'],
    ['name' => 'Automobile'],
    ['name' => 'Real Estate'],
    ['name' => 'Construction'],
    ['name' => 'Telecommunications'],
    ['name' => 'Logistics'],
    ['name' => 'Transportation'],
    ['name' => 'Hospitality'],
    ['name' => 'Tourism'],
    ['name' => 'Food & Beverage'],
    ['name' => 'Agriculture'],
    ['name' => 'Pharmaceutical'],
    ['name' => 'Media & Entertainment'],
    ['name' => 'Digital Marketing'],
    ['name' => 'Consulting'],
    ['name' => 'Human Resources'],
    ['name' => 'Legal Services'],
    ['name' => 'Energy'],
    ['name' => 'Oil & Gas'],
    ['name' => 'Mining'],
    ['name' => 'Textile'],
    ['name' => 'Electronics'],
    ['name' => 'Government'],
    ['name' => 'Non-Profit'],
    ['name' => 'FMCG'],
    ['name' => 'Import Export'],
];

        foreach ($industryTypes as $industryType) {
            IndustryType::firstOrCreate($industryType);
        }
    }
}
