<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BirthRecordSeeder extends Seeder
{
    public function run(): void
    {
        // Check if birth records already exist
        if (DB::table('birth_records')->count() > 0) {
            $this->command->info('Birth records table already has data. Skipping...');
            return;
        }

        $birthRecords = [
            [
                'child_name' => 'Baby Maria Santos',
                'birth_date' => '2025-01-15',
                'birth_time' => '08:30:00',
                'birth_place' => 'Manila Medical Center',
                'gender' => 'female',
                'birth_weight' => 3.2,
                'birth_height' => 49.5,
                'father_name' => 'Juan Santos',
                'father_citizenship' => 'Filipino',
                'father_occupation' => 'Engineer',
                'father_age_at_birth' => 32,
                'mother_maiden_name' => 'Ana Cruz',
                'mother_citizenship' => 'Filipino',
                'mother_occupation' => 'Teacher',
                'mother_age_at_birth' => 28,
                'parents_marriage_date' => '2020-06-15',
                'parents_marriage_place' => 'Our Lady of Peace Church',
                'residence_address' => '123 Main Street, Barangay San Jose',
                'residence_city' => 'Manila',
                'residence_province' => 'Metro Manila',
                'residence_country' => 'Philippines',
                'birth_certificate_no' => 'BC-2025-001',
                'registration_date' => '2025-01-20',
                'registered_by' => 'Juan Santos',
                'civil_registrar' => 'Manila Civil Registry Office',
                'is_baptized' => false,
                'psa_copy_issued' => false,
                'psa_copy_issue_date' => null,
                'psa_copies_count' => 0,
                'birth_type' => 'live',
                'status' => 'registered',
                'notes' => 'First child',
                'created_at' => Carbon::now()->subMonths(1),
                'updated_at' => Carbon::now()->subMonths(1)
            ],
            [
                'child_name' => 'Baby John Reyes',
                'birth_date' => '2025-02-10',
                'birth_time' => '14:45:00',
                'birth_place' => 'St. Lukes Medical Center',
                'gender' => 'male',
                'birth_weight' => 3.5,
                'birth_height' => 51.0,
                'father_name' => 'Miguel Reyes',
                'father_citizenship' => 'Filipino',
                'father_occupation' => 'Doctor',
                'father_age_at_birth' => 35,
                'mother_maiden_name' => 'Sofia Garcia',
                'mother_citizenship' => 'Filipino',
                'mother_occupation' => 'Nurse',
                'mother_age_at_birth' => 30,
                'parents_marriage_date' => '2019-12-10',
                'parents_marriage_place' => 'Holy Family Cathedral',
                'residence_address' => '456 Oak Avenue, Barangay Santa Cruz',
                'residence_city' => 'Quezon City',
                'residence_province' => 'Metro Manila',
                'residence_country' => 'Philippines',
                'birth_certificate_no' => 'BC-2025-002',
                'registration_date' => '2025-02-15',
                'registered_by' => 'Sofia Garcia-Reyes',
                'civil_registrar' => 'Quezon City Civil Registry Office',
                'is_baptized' => false,
                'psa_copy_issued' => true,
                'psa_copy_issue_date' => '2025-02-20',
                'psa_copies_count' => 2,
                'birth_type' => 'live',
                'status' => 'registered',
                'notes' => 'Second child',
                'created_at' => Carbon::now()->subWeeks(2),
                'updated_at' => Carbon::now()->subWeeks(2)
            ],
            [
                'child_name' => 'Baby Grace Tan',
                'birth_date' => '2025-03-05',
                'birth_time' => '10:15:00',
                'birth_place' => 'Makati Medical Center',
                'gender' => 'female',
                'birth_weight' => 2.9,
                'birth_height' => 48.0,
                'father_name' => 'David Tan',
                'father_citizenship' => 'Filipino-Chinese',
                'father_occupation' => 'Businessman',
                'father_age_at_birth' => 38,
                'mother_maiden_name' => 'Linda Wong',
                'mother_citizenship' => 'Filipino-Chinese',
                'mother_occupation' => 'Accountant',
                'mother_age_at_birth' => 33,
                'parents_marriage_date' => '2018-05-20',
                'parents_marriage_place' => 'Immaculate Conception Church',
                'residence_address' => '789 Ayala Street, Barangay Poblacion',
                'residence_city' => 'Makati',
                'residence_province' => 'Metro Manila',
                'residence_country' => 'Philippines',
                'birth_certificate_no' => 'BC-2025-003',
                'registration_date' => '2025-03-10',
                'registered_by' => 'David Tan',
                'civil_registrar' => 'Makati Civil Registry Office',
                'is_baptized' => false,
                'psa_copy_issued' => false,
                'psa_copy_issue_date' => null,
                'psa_copies_count' => 0,
                'birth_type' => 'live',
                'status' => 'pending',
                'notes' => null,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5)
            ]
        ];

        DB::table('birth_records')->insert($birthRecords);
    }
}
