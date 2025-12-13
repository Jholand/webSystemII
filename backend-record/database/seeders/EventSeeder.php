<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        // Check if events already exist
        if (DB::table('events')->count() > 0) {
            $this->command->info('Events table already has data. Skipping...');
            return;
        }

        $events = [
            [
                'title' => 'Christmas Mass 2025',
                'description' => 'Celebrate the birth of Jesus Christ with our parish community. Join us for a special midnight mass.',
                'event_date' => '2025-12-25',
                'start_time' => '00:00:00',
                'end_time' => '02:00:00',
                'location' => 'Main Church',
                'category' => 'Mass',
                'max_participants' => 500,
                'registered_count' => 350,
                'status' => 'planned',
                'contact_person' => 'Fr. Joseph Smith',
                'contact_number' => '09171234567',
                'budget' => 50000.00,
                'notes' => 'Choir performance included',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(30),
                'deleted_at' => null
            ],
            [
                'title' => 'Youth Retreat 2025',
                'description' => 'A 3-day spiritual retreat for young adults aged 18-30. Activities include prayer sessions, workshops, and team building.',
                'event_date' => '2025-06-15',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'location' => 'Retreat Center, Tagaytay',
                'category' => 'Retreat',
                'max_participants' => 50,
                'registered_count' => 35,
                'status' => 'planned',
                'contact_person' => 'Fr. Michael Chen',
                'contact_number' => '09187654321',
                'budget' => 75000.00,
                'notes' => 'Transportation and meals included',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(20),
                'updated_at' => Carbon::now()->subDays(20),
                'deleted_at' => null
            ],
            [
                'title' => 'Marriage Enrichment Seminar',
                'description' => 'A seminar for married couples to strengthen their relationship and deepen their faith together.',
                'event_date' => '2025-05-10',
                'start_time' => '09:00:00',
                'end_time' => '16:00:00',
                'location' => 'Parish Hall',
                'category' => 'Workshop',
                'max_participants' => 30,
                'registered_count' => 28,
                'status' => 'planned',
                'contact_person' => 'Fr. David Santos',
                'contact_number' => '09199876543',
                'budget' => 25000.00,
                'notes' => 'Lunch and materials provided',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(15),
                'updated_at' => Carbon::now()->subDays(15),
                'deleted_at' => null
            ],
            [
                'title' => 'Easter Sunday Celebration',
                'description' => 'Celebrate the resurrection of Christ with special masses and activities for the whole family.',
                'event_date' => '2025-04-20',
                'start_time' => '06:00:00',
                'end_time' => '12:00:00',
                'location' => 'Main Church and Grounds',
                'category' => 'Mass',
                'max_participants' => 800,
                'registered_count' => 600,
                'status' => 'ongoing',
                'contact_person' => 'Fr. Joseph Smith',
                'contact_number' => '09171234567',
                'budget' => 100000.00,
                'notes' => 'Multiple mass times, egg hunt for children',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(60),
                'updated_at' => Carbon::now()->subDays(1),
                'deleted_at' => null
            ],
            [
                'title' => 'Bible Study Conference',
                'description' => 'Annual conference featuring guest speakers on various biblical topics and discussions.',
                'event_date' => '2025-03-05',
                'start_time' => '08:00:00',
                'end_time' => '18:00:00',
                'location' => 'Conference Center',
                'category' => 'Conference',
                'max_participants' => 200,
                'registered_count' => 200,
                'status' => 'completed',
                'contact_person' => 'Fr. Robert Garcia',
                'contact_number' => '09161234567',
                'budget' => 80000.00,
                'notes' => 'Very successful event, consider expanding next year',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(90),
                'updated_at' => Carbon::now()->subDays(65),
                'deleted_at' => null
            ],
            [
                'title' => 'Charity Fun Run',
                'description' => 'Annual fun run to raise funds for our outreach programs. All ages welcome!',
                'event_date' => '2025-02-14',
                'start_time' => '05:00:00',
                'end_time' => '10:00:00',
                'location' => 'City Park',
                'category' => 'Fundraising',
                'max_participants' => 300,
                'registered_count' => 285,
                'status' => 'completed',
                'contact_person' => 'Michael Chen',
                'contact_number' => '09151112222',
                'budget' => 45000.00,
                'notes' => 'Raised ₱150,000 for charity',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(120),
                'updated_at' => Carbon::now()->subDays(95),
                'deleted_at' => null
            ],
            [
                'title' => 'Parish Fiesta Planning Meeting',
                'description' => 'Meeting cancelled due to scheduling conflicts',
                'event_date' => '2025-07-01',
                'start_time' => '18:00:00',
                'end_time' => '20:00:00',
                'location' => 'Parish Office',
                'category' => 'Meeting',
                'max_participants' => 20,
                'registered_count' => 0,
                'status' => 'cancelled',
                'contact_person' => 'Church Administrator',
                'contact_number' => '09162223333',
                'budget' => 0.00,
                'notes' => 'Rescheduled to next month',
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(5),
                'deleted_at' => null
            ]
        ];

        DB::table('events')->insert($events);
    }
}
