<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $logs = [
            [
                'action' => 'Login',
                'actor' => 'System Administrator',
                'actor_email' => 'admin@church.com',
                'details' => 'Successful login',
                'category' => 'Authentication',
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2)
            ],
            [
                'action' => 'Create Member',
                'actor' => 'System Administrator',
                'actor_email' => 'admin@church.com',
                'details' => 'Created new member: Michael Anderson',
                'category' => 'Members',
                'created_at' => now()->subHours(1),
                'updated_at' => now()->subHours(1)
            ],
            [
                'action' => 'Record Donation',
                'actor' => 'Church Accountant',
                'actor_email' => 'accountant@church.com',
                'details' => 'Recorded donation of ₱5000',
                'category' => 'Donations',
                'created_at' => now()->subMinutes(45),
                'updated_at' => now()->subMinutes(45)
            ],
            [
                'action' => 'Update Schedule',
                'actor' => 'Church Administrator',
                'actor_email' => 'churchadmin@church.com',
                'details' => 'Updated Sunday Mass schedule',
                'category' => 'Schedules',
                'created_at' => now()->subMinutes(30),
                'updated_at' => now()->subMinutes(30)
            ],
            [
                'action' => 'Create Baptism Record',
                'actor' => 'Fr. Joseph Smith',
                'actor_email' => 'priest@church.com',
                'details' => 'Created baptism record for Baby Michael',
                'category' => 'Baptism Records',
                'created_at' => now()->subMinutes(15),
                'updated_at' => now()->subMinutes(15)
            ],
        ];

        DB::table('audit_logs')->insert($logs);
    }
}
