<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        // Check if announcements already exist
        if (DB::table('announcements')->count() > 0) {
            $this->command->info('Announcements table already has data. Skipping...');
            return;
        }

        $announcements = [
            [
                'title' => 'Christmas Mass Schedule',
                'content' => 'Join us for our special Christmas masses! Midnight Mass at 12:00 AM, Morning Mass at 6:00 AM and 8:00 AM. Regular Sunday masses will also be held. Please arrive early as seating is limited.',
                'category' => 'Event',
                'priority' => 'high',
                'publish_date' => Carbon::now()->subDays(5)->format('Y-m-d'),
                'expiry_date' => '2025-12-26',
                'status' => 'published',
                'target_audience' => 'All',
                'display_on_homepage' => true,
                'send_notification' => true,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(5),
                'deleted_at' => null
            ],
            [
                'title' => 'Church Office Hours Update',
                'content' => 'Please be informed that the church office will have new operating hours starting next week. Monday to Friday: 8:00 AM - 5:00 PM, Saturday: 8:00 AM - 12:00 PM. Closed on Sundays and holidays.',
                'category' => 'General',
                'priority' => 'medium',
                'publish_date' => Carbon::now()->subDays(3)->format('Y-m-d'),
                'expiry_date' => '2025-12-31',
                'status' => 'published',
                'target_audience' => 'All',
                'display_on_homepage' => true,
                'send_notification' => false,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
                'deleted_at' => null
            ],
            [
                'title' => 'Youth Retreat Registration Open',
                'content' => 'Registration is now open for our annual Youth Retreat happening on June 15-17, 2025. Limited slots available for ages 18-30. Early bird discount until May 1st. Contact the parish office for more details.',
                'category' => 'Event',
                'priority' => 'medium',
                'publish_date' => Carbon::now()->subDays(10)->format('Y-m-d'),
                'expiry_date' => '2025-06-10',
                'status' => 'published',
                'target_audience' => 'Members',
                'display_on_homepage' => true,
                'send_notification' => true,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(10),
                'deleted_at' => null
            ],
            [
                'title' => 'Emergency: Church Closure Due to Weather',
                'content' => 'URGENT: Due to severe weather conditions, all church activities for today are cancelled. Please stay safe and we will update you on tomorrow\'s schedule. Emergency contact: 09171234567',
                'category' => 'Urgent',
                'priority' => 'urgent',
                'publish_date' => Carbon::now()->subDays(1)->format('Y-m-d'),
                'expiry_date' => Carbon::now()->addDays(1)->format('Y-m-d'),
                'status' => 'published',
                'target_audience' => 'All',
                'display_on_homepage' => true,
                'send_notification' => true,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
                'deleted_at' => null
            ],
            [
                'title' => 'Parish Donation Drive for Typhoon Victims',
                'content' => 'Our parish is organizing a donation drive to help victims of the recent typhoon. We are accepting cash donations, food items, clothing, and hygiene products. Drop-off points are available at the parish office.',
                'category' => 'General',
                'priority' => 'high',
                'publish_date' => Carbon::now()->subDays(7)->format('Y-m-d'),
                'expiry_date' => '2025-12-31',
                'status' => 'published',
                'target_audience' => 'All',
                'display_on_homepage' => true,
                'send_notification' => true,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(7),
                'deleted_at' => null
            ],
            [
                'title' => 'Marriage Enrichment Seminar',
                'content' => 'All married couples are invited to join our Marriage Enrichment Seminar on May 10, 2025. Topics include communication, conflict resolution, and spiritual growth. Registration fee: ₱1,000 per couple.',
                'category' => 'Event',
                'priority' => 'low',
                'publish_date' => Carbon::now()->format('Y-m-d'),
                'expiry_date' => '2025-05-09',
                'status' => 'published',
                'target_audience' => 'Members',
                'display_on_homepage' => false,
                'send_notification' => false,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'deleted_at' => null
            ],
            [
                'title' => 'Draft: Easter Sunday Plans',
                'content' => 'Planning for Easter Sunday celebration including sunrise service, multiple mass times, and children\'s activities. Budget approval pending.',
                'category' => 'Event',
                'priority' => 'medium',
                'publish_date' => '2025-03-01',
                'expiry_date' => '2025-04-21',
                'status' => 'draft',
                'target_audience' => 'Staff',
                'display_on_homepage' => false,
                'send_notification' => false,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
                'deleted_at' => null
            ],
            [
                'title' => 'Archived: Lenten Season Schedule 2024',
                'content' => 'Past announcement regarding Lenten season activities from last year.',
                'category' => 'Event',
                'priority' => 'low',
                'publish_date' => '2024-02-01',
                'expiry_date' => '2024-04-10',
                'status' => 'archived',
                'target_audience' => 'All',
                'display_on_homepage' => false,
                'send_notification' => false,
                'attachment_path' => null,
                'created_by' => 'Church Administrator',
                'created_at' => Carbon::now()->subMonths(10),
                'updated_at' => Carbon::now()->subMonths(8),
                'deleted_at' => null
            ]
        ];

        DB::table('announcements')->insert($announcements);
    }
}
