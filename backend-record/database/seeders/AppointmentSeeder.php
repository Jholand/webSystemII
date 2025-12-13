<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        // Check if appointments already exist
        if (DB::table('appointments')->count() > 0) {
            $this->command->info('Appointments table already has data. Skipping...');
            return;
        }

        $appointments = [
            [
                'type' => 'Wedding',
                'client_name' => 'Michael Johnson & Sarah Lee',
                'contact_number' => '09171234567',
                'email' => 'michael.johnson@email.com',
                'appointment_date' => Carbon::now()->addDays(30)->format('Y-m-d'),
                'appointment_time' => '14:00:00',
                'status' => 'Confirmed',
                'event_fee' => 15000.00,
                'notes' => 'Outdoor wedding ceremony requested',
                'is_paid' => true,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10)
            ],
            [
                'type' => 'Baptism',
                'client_name' => 'Emma Martinez',
                'contact_number' => '09187654321',
                'email' => 'emma.martinez@email.com',
                'appointment_date' => Carbon::now()->addDays(15)->format('Y-m-d'),
                'appointment_time' => '10:00:00',
                'status' => 'Confirmed',
                'event_fee' => 3000.00,
                'notes' => 'Baptism for twins',
                'is_paid' => true,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7)
            ],
            [
                'type' => 'Mass Intention',
                'client_name' => 'Robert Cruz',
                'contact_number' => '09199876543',
                'email' => 'robert.cruz@email.com',
                'appointment_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'appointment_time' => '06:00:00',
                'status' => 'Pending',
                'event_fee' => 500.00,
                'notes' => 'In memory of mother',
                'is_paid' => false,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)
            ],
            [
                'type' => 'Funeral',
                'client_name' => 'David Santos Family',
                'contact_number' => '09161234567',
                'email' => 'david.santos@email.com',
                'appointment_date' => Carbon::now()->addDays(2)->format('Y-m-d'),
                'appointment_time' => '15:00:00',
                'status' => 'Confirmed',
                'event_fee' => 8000.00,
                'notes' => 'Full funeral mass service',
                'is_paid' => true,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            [
                'type' => 'Blessing',
                'client_name' => 'Linda Tan',
                'contact_number' => '09151112222',
                'email' => 'linda.tan@email.com',
                'appointment_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                'appointment_time' => '16:00:00',
                'status' => 'Pending',
                'event_fee' => 2000.00,
                'notes' => 'House blessing',
                'is_paid' => false,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'type' => 'Wedding',
                'client_name' => 'James Wilson & Mary Ann Brown',
                'contact_number' => '09162223333',
                'email' => 'james.wilson@email.com',
                'appointment_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'appointment_time' => '15:00:00',
                'status' => 'Completed',
                'event_fee' => 18000.00,
                'notes' => 'Garden wedding',
                'is_paid' => true,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(5)
            ],
            [
                'type' => 'Other',
                'client_name' => 'Peter Garcia',
                'contact_number' => '09173334444',
                'email' => 'peter.garcia@email.com',
                'appointment_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
                'appointment_time' => '09:00:00',
                'status' => 'Cancelled',
                'event_fee' => 1500.00,
                'notes' => 'Counseling session - cancelled by client',
                'is_paid' => false,
                'payment_id' => null,
                'created_by' => 5,
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(1)
            ]
        ];

        DB::table('appointments')->insert($appointments);
    }
}
