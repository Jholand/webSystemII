<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BaptismRecordSeeder extends Seeder
{
    public function run(): void
    {
        // Check if baptism records already exist
        if (DB::table('baptism_records')->count() > 0) {
            $this->command->info('Baptism records already exist. Skipping baptism record seeding.');
            return;
        }

        $priests = DB::table('priests')->get();
        if ($priests->isEmpty()) {
            $this->command->info('No priests found. Skipping baptism records.');
            return;
        }

        $records = [
            [
                'child_name' => 'Baby Michael Anderson',
                'child_birthdate' => '2025-09-15',
                'child_birthplace' => 'City Hospital',
                'child_gender' => 'male',
                'father_name' => 'Michael Anderson Sr.',
                'mother_name' => 'Jennifer Anderson',
                'parents_address' => '123 Main St, City',
                'baptism_date' => '2025-10-20',
                'baptism_time' => '10:00:00',
                'baptism_location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'godfather_name' => 'Robert Wilson',
                'godmother_name' => 'Sarah Martinez',
                'baptism_certificate_no' => 'BC-2025-001',
                'certificate_issued_date' => '2025-10-21',
                'notes' => 'Regular baptism ceremony',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'child_name' => 'Baby Sofia Rodriguez',
                'child_birthdate' => '2025-08-10',
                'child_birthplace' => 'St. Mary Hospital',
                'child_gender' => 'female',
                'father_name' => 'Carlos Rodriguez',
                'mother_name' => 'Maria Rodriguez',
                'parents_address' => '456 Oak Ave, City',
                'baptism_date' => '2025-09-25',
                'baptism_time' => '11:00:00',
                'baptism_location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'godfather_name' => 'Juan Gomez',
                'godmother_name' => 'Ana Lopez',
                'baptism_certificate_no' => 'BC-2025-002',
                'certificate_issued_date' => '2025-09-26',
                'notes' => 'Family baptism',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('baptism_records')->insert($records);
    }
}
