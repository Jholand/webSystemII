<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ServiceRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Check if service requests already exist
        if (DB::table('service_requests')->count() > 0) {
            $this->command->info('Service requests table already has data. Skipping...');
            return;
        }

        $serviceRequests = [
            [
                'request_type' => 'Baptism',
                'requestor_name' => 'Maria Santos',
                'contact_number' => '09171234567',
                'email' => 'maria.santos@email.com',
                'preferred_date' => Carbon::now()->addDays(20)->format('Y-m-d'),
                'preferred_time' => '10:00:00',
                'details' => 'Baptism for my newborn daughter, Emma Grace Santos. Born on January 15, 2025.',
                'special_requirements' => 'Prefer morning schedule, will bring 2 godparents',
                'assigned_priest' => 'Fr. Joseph Smith',
                'status' => 'scheduled',
                'priority' => 'normal',
                'scheduled_date' => Carbon::now()->addDays(20)->format('Y-m-d'),
                'scheduled_time' => '10:00:00',
                'admin_notes' => 'Confirmed with priest. Baptismal certificate prepared.',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(5),
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(5),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Wedding',
                'requestor_name' => 'John Michael Cruz & Lisa Marie Tan',
                'contact_number' => '09187654321',
                'email' => 'john.cruz@email.com',
                'preferred_date' => Carbon::now()->addMonths(6)->format('Y-m-d'),
                'preferred_time' => '15:00:00',
                'details' => 'We would like to request a church wedding ceremony. Both of us are baptized Catholics.',
                'special_requirements' => 'Outdoor garden ceremony if weather permits, expecting 150 guests',
                'assigned_priest' => 'Fr. Michael Chen',
                'status' => 'approved',
                'priority' => 'normal',
                'scheduled_date' => null,
                'scheduled_time' => null,
                'admin_notes' => 'Approved. Awaiting submission of required documents.',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(3),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Mass Intention',
                'requestor_name' => 'Robert Garcia',
                'contact_number' => '09199876543',
                'email' => 'robert.garcia@email.com',
                'preferred_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                'preferred_time' => '06:00:00',
                'details' => 'Mass intention for the repose of the soul of my mother, Carmen Garcia, on her 1st death anniversary.',
                'special_requirements' => null,
                'assigned_priest' => null,
                'status' => 'pending',
                'priority' => 'normal',
                'scheduled_date' => null,
                'scheduled_time' => null,
                'admin_notes' => null,
                'processed_by' => null,
                'processed_at' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Counseling',
                'requestor_name' => 'Sarah Johnson',
                'contact_number' => '09161234567',
                'email' => 'sarah.johnson@email.com',
                'preferred_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'preferred_time' => '14:00:00',
                'details' => 'Requesting spiritual counseling regarding family matters. Prefer private consultation.',
                'special_requirements' => 'Confidential session requested',
                'assigned_priest' => 'Fr. David Santos',
                'status' => 'scheduled',
                'priority' => 'urgent',
                'scheduled_date' => Carbon::now()->addDays(5)->format('Y-m-d'),
                'scheduled_time' => '14:00:00',
                'admin_notes' => 'Scheduled for private counseling room',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(1),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Blessing',
                'requestor_name' => 'David Reyes',
                'contact_number' => '09151112222',
                'email' => 'david.reyes@email.com',
                'preferred_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
                'preferred_time' => '16:00:00',
                'details' => 'House blessing for our new home at 123 Main Street, Quezon City.',
                'special_requirements' => 'Need transportation assistance to the location',
                'assigned_priest' => 'Fr. Robert Garcia',
                'status' => 'approved',
                'priority' => 'normal',
                'scheduled_date' => Carbon::now()->addDays(10)->format('Y-m-d'),
                'scheduled_time' => '16:00:00',
                'admin_notes' => 'Transportation arranged. Confirmed with priest.',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(2),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Baptism',
                'requestor_name' => 'Linda Fernandez',
                'contact_number' => '09162223333',
                'email' => 'linda.fernandez@email.com',
                'preferred_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'preferred_time' => '11:00:00',
                'details' => 'Baptism for my son, completed last week.',
                'special_requirements' => null,
                'assigned_priest' => 'Fr. Joseph Smith',
                'status' => 'completed',
                'priority' => 'normal',
                'scheduled_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'scheduled_time' => '11:00:00',
                'admin_notes' => 'Service completed successfully. Certificate issued.',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(20),
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(5),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Wedding',
                'requestor_name' => 'Peter Wong & Grace Lee',
                'contact_number' => '09173334444',
                'email' => 'peter.wong@email.com',
                'preferred_date' => Carbon::now()->addDays(15)->format('Y-m-d'),
                'preferred_time' => '14:00:00',
                'details' => 'Wedding ceremony request - cancelled due to personal reasons.',
                'special_requirements' => null,
                'assigned_priest' => null,
                'status' => 'cancelled',
                'priority' => 'normal',
                'scheduled_date' => null,
                'scheduled_time' => null,
                'admin_notes' => 'Cancelled by client. Refund processed.',
                'processed_by' => 'Church Administrator',
                'processed_at' => Carbon::now()->subDays(4),
                'created_at' => Carbon::now()->subDays(25),
                'updated_at' => Carbon::now()->subDays(4),
                'deleted_at' => null
            ],
            [
                'request_type' => 'Mass Intention',
                'requestor_name' => 'Thomas Anderson',
                'contact_number' => '09184445555',
                'email' => 'thomas.anderson@email.com',
                'preferred_date' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'preferred_time' => '06:00:00',
                'details' => 'Thanksgiving mass for successful business venture.',
                'special_requirements' => 'Would like to donate flowers for the altar',
                'assigned_priest' => null,
                'status' => 'pending',
                'priority' => 'normal',
                'scheduled_date' => null,
                'scheduled_time' => null,
                'admin_notes' => null,
                'processed_by' => null,
                'processed_at' => null,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12),
                'deleted_at' => null
            ]
        ];

        DB::table('service_requests')->insert($serviceRequests);
    }
}
