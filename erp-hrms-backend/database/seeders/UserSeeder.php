<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the users table with default CRM users.
     */
    public function run(): void
    {
        $users = [
            [
                'name'              => 'Admin',
                'email'             => 'admin@crm.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Sales Manager',
                'email'             => 'sales.manager@crm.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Sales Rep 1',
                'email'             => 'sales.rep1@crm.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Sales Rep 2',
                'email'             => 'sales.rep2@crm.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
            [
                'name'              => 'Support Agent',
                'email'             => 'support@crm.com',
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'created_at'        => now(),
                'updated_at'        => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insertOrIgnore($user);
        }
    }
}
