<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Priest;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Members
        Member::create([
            'name' => 'Michael James Anderson',
            'email' => 'michael.anderson@email.com',
            'phone' => '+1234567890',
            'address' => '123 Main St, City',
            'date_joined' => '2020-01-15',
            'ministry' => 'Choir',
            'status' => 'Active',
        ]);

        Member::create([
            'name' => 'Sarah Elizabeth Johnson',
            'email' => 'sarah.johnson@email.com',
            'phone' => '+1234567891',
            'address' => '456 Oak Ave, City',
            'date_joined' => '2019-05-22',
            'ministry' => 'Youth Ministry',
            'status' => 'Active',
        ]);

        Member::create([
            'name' => 'Robert David Wilson',
            'email' => 'robert.wilson@email.com',
            'phone' => '+1234567892',
            'address' => '789 Pine Rd, City',
            'date_joined' => '2021-08-10',
            'ministry' => 'None',
            'status' => 'Inactive',
        ]);

        // Sample Priests
        Priest::create([
            'name' => 'Fr. John Smith',
            'email' => 'fr.john@church.com',
            'phone' => '+1234567890',
            'ordained_date' => '2010-05-15',
            'specialty' => 'Marriage Counseling',
            'status' => 'active',
        ]);

        Priest::create([
            'name' => 'Fr. Michael Brown',
            'email' => 'fr.michael@church.com',
            'phone' => '+1234567891',
            'ordained_date' => '2015-08-20',
            'specialty' => 'Youth Ministry',
            'status' => 'active',
        ]);
    }
}
