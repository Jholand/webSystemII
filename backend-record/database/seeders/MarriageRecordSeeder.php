<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MarriageRecordSeeder extends Seeder
{
    public function run(): void
    {
        // Check if marriage records already exist
        if (DB::table('marriage_records')->count() > 0) {
            $this->command->info('Marriage records already exist. Skipping marriage record seeding.');
            return;
        }

        $priests = DB::table('priests')->get();
        if ($priests->isEmpty()) {
            $this->command->info('No priests found. Skipping marriage records.');
            return;
        }

        $records = [
            [
                'groom_name' => 'John Michael Smith',
                'groom_birthdate' => '1995-05-15',
                'groom_birthplace' => 'Manila',
                'groom_father_name' => 'Michael Smith Sr.',
                'groom_mother_name' => 'Elizabeth Smith',
                'groom_address' => '123 Main St, City',
                'groom_religion' => 'Catholic',
                'groom_civil_status' => 'single',
                'bride_name' => 'Mary Jane Doe',
                'bride_birthdate' => '1997-08-20',
                'bride_birthplace' => 'Quezon City',
                'bride_father_name' => 'James Doe',
                'bride_mother_name' => 'Sarah Doe',
                'bride_address' => '456 Oak Ave, City',
                'bride_religion' => 'Catholic',
                'bride_civil_status' => 'single',
                'marriage_date' => '2025-11-15',
                'marriage_time' => '14:00:00',
                'marriage_location' => 'Main Church',
                'marriage_certificate_no' => 'MC-2025-001',
                'certificate_issued_date' => '2025-11-16',
                'priest_id' => $priests->first()->id,
                'sponsors' => json_encode(['Robert Brown', 'Lisa Martinez', 'James Taylor', 'Anna Wilson']),
                'witness_1_name' => 'Robert Brown',
                'witness_2_name' => 'Sarah Johnson',
                'marriage_license_no' => 'ML-2025-001',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('marriage_records')->insert($records);
    }
}
