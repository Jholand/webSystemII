<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if schedules already exist
        if (DB::table('schedules')->count() > 0) {
            $this->command->info('Schedules already exist. Skipping schedule seeding.');
            return;
        }

        $priests = DB::table('priests')->get();
        
        if ($priests->isEmpty()) {
            $this->command->info('No priests found. Please run MemberSeeder first.');
            return;
        }

        $schedules = [
            [
                'title' => 'Sunday Morning Mass',
                'date' => '2025-11-30',
                'time' => '08:00:00',
                'end_time' => '09:30:00',
                'type' => 'Mass',
                'location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'description' => 'Weekly Sunday morning mass',
                'attendees' => 450,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Wedding Ceremony',
                'date' => '2025-12-05',
                'time' => '14:00:00',
                'end_time' => '16:00:00',
                'type' => 'Wedding',
                'location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'description' => 'Wedding of John and Mary',
                'attendees' => 200,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Baptism Ceremony',
                'date' => '2025-12-08',
                'time' => '10:00:00',
                'end_time' => '11:30:00',
                'type' => 'Baptism',
                'location' => 'Baptistry',
                'priest_id' => $priests->count() > 1 ? $priests->skip(1)->first()->id : $priests->first()->id,
                'description' => 'Baptism of several children',
                'attendees' => 50,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Evening Mass',
                'date' => '2025-11-27',
                'time' => '18:00:00',
                'end_time' => '19:00:00',
                'type' => 'Mass',
                'location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'description' => 'Evening prayer mass',
                'attendees' => 180,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Youth Ministry Meeting',
                'date' => '2025-11-28',
                'time' => '16:00:00',
                'end_time' => '18:00:00',
                'type' => 'Meeting',
                'location' => 'Parish Hall',
                'priest_id' => null,
                'description' => 'Monthly youth gathering',
                'attendees' => 45,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Christmas Mass',
                'date' => '2025-12-25',
                'time' => '10:00:00',
                'end_time' => '12:00:00',
                'type' => 'Mass',
                'location' => 'Main Church',
                'priest_id' => $priests->first()->id,
                'description' => 'Christmas Day celebration',
                'attendees' => 800,
                'status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('schedules')->insert($schedules);
    }
}
