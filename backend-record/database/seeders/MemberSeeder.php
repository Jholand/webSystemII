<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if members already exist
        if (DB::table('members')->count() > 0) {
            $this->command->info('Members already exist. Skipping member seeding.');
            return;
        }

        // Sample Members
        $members = [
            [
                'name' => 'Michael James Anderson',
                'email' => 'michael.anderson@email.com',
                'phone' => '+1234567890',
                'address' => '123 Main St, City',
                'date_joined' => '2020-01-15',
                'ministry' => 'Choir',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sarah Elizabeth Johnson',
                'email' => 'sarah.johnson@email.com',
                'phone' => '+1234567891',
                'address' => '456 Oak Ave, City',
                'date_joined' => '2019-05-22',
                'ministry' => 'Youth Ministry',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Robert David Wilson',
                'email' => 'robert.wilson@email.com',
                'phone' => '+1234567892',
                'address' => '789 Pine Rd, City',
                'date_joined' => '2021-08-10',
                'ministry' => 'None',
                'status' => 'Inactive',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('members')->insert($members);

        // Check if priests already exist
        if (DB::table('priests')->count() > 0) {
            $this->command->info('Priests already exist. Skipping priest seeding.');
            return;
        }

        // Sample Priests
        $priests = [
            [
                'name' => 'Fr. John Smith',
                'email' => 'fr.john@church.com',
                'phone' => '+1234567890',
                'ordained_date' => '2010-05-15',
                'specialty' => 'Marriage Counseling',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fr. Michael Brown',
                'email' => 'fr.michael@church.com',
                'phone' => '+1234567891',
                'ordained_date' => '2015-08-20',
                'specialty' => 'Youth Ministry',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('priests')->insert($priests);
    }
}
