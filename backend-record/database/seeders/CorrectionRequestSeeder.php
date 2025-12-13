<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CorrectionRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Check if correction requests already exist
        if (DB::table('correction_requests')->count() > 0) {
            $this->command->info('Correction requests table already has data. Skipping...');
            return;
        }

        $correctionRequests = [
            [
                'user_id' => 5, // John Doe (user)
                'user_name' => 'John Doe',
                'user_email' => 'user@church.com',
                'member_id' => '1',
                'request' => 'I need to update my contact number and address in the church records. My phone number has changed and I have moved to a new residence.',
                'fields_to_edit' => json_encode([
                    'phone' => '09171234567',
                    'address' => '456 New Street, Quezon City'
                ]),
                'status' => 'pending',
                'completed' => false,
                'submitted_at' => Carbon::now()->subDays(2),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'completed_at' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)
            ],
            [
                'user_id' => 5,
                'user_name' => 'Jane Smith',
                'user_email' => 'jane.smith@email.com',
                'member_id' => '2',
                'request' => 'My middle name is incorrectly spelled in the records. It should be "Marie" not "Mary".',
                'fields_to_edit' => json_encode([
                    'middle_name' => 'Marie'
                ]),
                'status' => 'approved',
                'completed' => false,
                'submitted_at' => Carbon::now()->subDays(5),
                'reviewed_at' => Carbon::now()->subDays(3),
                'reviewed_by' => 'Church Administrator',
                'completed_at' => null,
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(3)
            ],
            [
                'user_id' => 5,
                'user_name' => 'Michael Anderson',
                'user_email' => 'michael.anderson@email.com',
                'member_id' => '3',
                'request' => 'Please update my email address. I no longer use my old email and need to change it to my current one.',
                'fields_to_edit' => json_encode([
                    'email' => 'michael.new@email.com'
                ]),
                'status' => 'approved',
                'completed' => true,
                'submitted_at' => Carbon::now()->subDays(10),
                'reviewed_at' => Carbon::now()->subDays(8),
                'reviewed_by' => 'Church Administrator',
                'completed_at' => Carbon::now()->subDays(7),
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(7)
            ],
            [
                'user_id' => 5,
                'user_name' => 'Sarah Brown',
                'user_email' => 'sarah.brown@email.com',
                'member_id' => '4',
                'request' => 'My birthdate in the system is wrong. The correct date should be May 15, 1990, not May 15, 1991.',
                'fields_to_edit' => json_encode([
                    'birthdate' => '1990-05-15'
                ]),
                'status' => 'rejected',
                'completed' => false,
                'submitted_at' => Carbon::now()->subDays(7),
                'reviewed_at' => Carbon::now()->subDays(6),
                'reviewed_by' => 'Church Administrator',
                'completed_at' => null,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(6)
            ],
            [
                'user_id' => 5,
                'user_name' => 'David Garcia',
                'user_email' => 'david.garcia@email.com',
                'member_id' => '5',
                'request' => 'Need to update my marital status and spouse information. I got married last month.',
                'fields_to_edit' => json_encode([
                    'marital_status' => 'Married',
                    'spouse_name' => 'Maria Garcia'
                ]),
                'status' => 'pending',
                'completed' => false,
                'submitted_at' => Carbon::now()->subDays(1),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'completed_at' => null,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            [
                'user_id' => 5,
                'user_name' => 'Robert Lee',
                'user_email' => 'robert.lee@email.com',
                'member_id' => '1',
                'request' => 'Correction of occupation field. Current occupation listed is outdated.',
                'fields_to_edit' => json_encode([
                    'occupation' => 'Senior Software Engineer'
                ]),
                'status' => 'approved',
                'completed' => true,
                'submitted_at' => Carbon::now()->subDays(15),
                'reviewed_at' => Carbon::now()->subDays(13),
                'reviewed_by' => 'Church Administrator',
                'completed_at' => Carbon::now()->subDays(12),
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(12)
            ]
        ];

        DB::table('correction_requests')->insert($correctionRequests);
    }
}
