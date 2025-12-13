<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DonationSeeder extends Seeder
{
    public function run(): void
    {
        // Check if donations already exist
        if (DB::table('donations')->count() > 0) {
            $this->command->info('Donations already exist. Skipping donation seeding.');
            return;
        }

        $donations = [
            [
                'donor_name' => 'John Doe',
                'contact_number' => '+1234567890',
                'email' => 'john.doe@email.com',
                'category' => 'Tithes and Offerings',
                'amount' => 5000.00,
                'payment_method' => 'Cash',
                'reference_number' => null,
                'donation_date' => '2025-11-29',
                'purpose' => 'Monthly tithe',
                'receipt_number' => 'DN-2025-001',
                'status' => 'confirmed',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'donor_name' => 'Mary Smith',
                'contact_number' => '+1234567891',
                'email' => 'mary.smith@email.com',
                'category' => 'Building Fund',
                'amount' => 10000.00,
                'payment_method' => 'Bank Transfer',
                'reference_number' => 'BT-123456',
                'donation_date' => '2025-12-01',
                'purpose' => 'Church renovation',
                'receipt_number' => 'DN-2025-002',
                'status' => 'confirmed',
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ],
            [
                'donor_name' => 'Robert Johnson',
                'contact_number' => '+1234567892',
                'email' => null,
                'category' => 'Mission Fund',
                'amount' => 2500.00,
                'payment_method' => 'Cash',
                'reference_number' => null,
                'donation_date' => '2025-12-02',
                'purpose' => 'Mission support',
                'receipt_number' => 'DN-2025-003',
                'status' => 'confirmed',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'donor_name' => 'Sarah Williams',
                'contact_number' => null,
                'email' => 'sarah.w@email.com',
                'category' => 'Tithes and Offerings',
                'amount' => 3000.00,
                'payment_method' => 'GCash',
                'reference_number' => 'GC-789012',
                'donation_date' => '2025-12-03',
                'purpose' => 'Weekly offering',
                'receipt_number' => 'DN-2025-004',
                'status' => 'confirmed',
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
            [
                'donor_name' => 'Michael Brown',
                'contact_number' => '+1234567893',
                'email' => null,
                'category' => 'Mass Intentions',
                'amount' => 500.00,
                'payment_method' => 'Cash',
                'reference_number' => null,
                'donation_date' => '2025-12-04',
                'purpose' => 'Mass intention for deceased relative',
                'receipt_number' => 'DN-2025-005',
                'status' => 'confirmed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('donations')->insert($donations);
    }
}
