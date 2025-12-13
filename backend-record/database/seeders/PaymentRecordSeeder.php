<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentRecordSeeder extends Seeder
{
    public function run(): void
    {
        // Check if payment records already exist
        if (DB::table('payment_records')->count() > 0) {
            $this->command->info('Payment records already exist. Skipping payment record seeding.');
            return;
        }

        $payments = [
            [
                'user_id' => 1,
                'payment_type' => 'sacrament_fee',
                'service_name' => 'Baptism',
                'amount' => 500.00,
                'payment_method' => 'cash',
                'reference_number' => 'PAY-2025-001',
                'description' => 'Baptism fee for Baby Michael Anderson',
                'recorded_by' => 'Admin User',
                'payment_date' => now()->subDays(10),
                'visible_to_user' => true,
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'user_id' => 2,
                'payment_type' => 'sacrament_fee',
                'service_name' => 'Wedding',
                'amount' => 2000.00,
                'payment_method' => 'bank_transfer',
                'reference_number' => 'PAY-2025-002',
                'description' => 'Wedding ceremony fee',
                'recorded_by' => 'Accountant User',
                'payment_date' => now()->subDays(7),
                'visible_to_user' => true,
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],
            [
                'user_id' => 3,
                'payment_type' => 'sacrament_fee',
                'service_name' => 'Confirmation',
                'amount' => 300.00,
                'payment_method' => 'gcash',
                'reference_number' => 'PAY-2025-003',
                'description' => 'Confirmation fee',
                'recorded_by' => 'Admin User',
                'payment_date' => now()->subDays(2),
                'visible_to_user' => true,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'user_id' => 1,
                'payment_type' => 'donation',
                'service_name' => 'Mass Intention',
                'amount' => 200.00,
                'payment_method' => 'cash',
                'reference_number' => 'PAY-2025-004',
                'description' => 'Mass intention offering',
                'recorded_by' => 'Admin User',
                'payment_date' => now()->subDay(),
                'visible_to_user' => true,
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ],
        ];

        DB::table('payment_records')->insert($payments);
    }
}
