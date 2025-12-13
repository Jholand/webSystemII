<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        // Check if messages already exist
        if (DB::table('messages')->count() > 0) {
            $this->command->info('Messages table already has data. Skipping...');
            return;
        }

        $messages = [
            [
                'user_id' => 5, // John Doe (user)
                'sender_type' => 'user',
                'sender_id' => 5,
                'message' => 'Hello, I would like to inquire about the requirements for baptism. Can you please provide me with the complete list of documents needed?',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(4),
                'created_at' => Carbon::now()->subDays(5),
                'updated_at' => Carbon::now()->subDays(4)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'secretary',
                'sender_id' => 3, // Church Administrator
                'message' => 'Good day! For baptism, you will need: 1) Birth Certificate, 2) Marriage Certificate of Parents (if applicable), 3) Baptismal Certificate of Parents, 4) Certificate of Attendance for Baptism Seminar. The seminar is held every first Saturday of the month.',
                'attachments' => json_encode(['baptism_requirements.pdf']),
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(4),
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(4)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'user',
                'sender_id' => 5,
                'message' => 'Thank you for the information! When is the next available seminar date?',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(4),
                'updated_at' => Carbon::now()->subDays(3)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'secretary',
                'sender_id' => 3,
                'message' => 'The next baptism seminar will be held on January 6, 2026 at 9:00 AM. Please register at least one week in advance. You can register online through our portal or visit the parish office.',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'user',
                'sender_id' => 5,
                'message' => 'I submitted a correction request for my contact information. How long will it take to process?',
                'attachments' => null,
                'is_read' => false,
                'read_at' => null,
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'user',
                'sender_id' => 5,
                'message' => 'Good morning! I would like to schedule a mass intention for my late mother. What are the available dates?',
                'attachments' => null,
                'is_read' => false,
                'read_at' => null,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'secretary',
                'sender_id' => 3,
                'message' => 'Welcome to our parish messaging system! If you have any questions or concerns, feel free to message us here. We typically respond within 24 hours during business days.',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(10),
                'created_at' => Carbon::now()->subDays(30),
                'updated_at' => Carbon::now()->subDays(10)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'secretary',
                'sender_id' => 3,
                'message' => 'Reminder: Your appointment for baptism is scheduled for December 20, 2025 at 10:00 AM. Please arrive 15 minutes early. Bring all required documents.',
                'attachments' => json_encode(['appointment_confirmation.pdf']),
                'is_read' => false,
                'read_at' => null,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'user',
                'sender_id' => 5,
                'message' => 'Is there a fee for the baptism service? If so, how much and how can I pay?',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(6),
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(6)
            ],
            [
                'user_id' => 5,
                'sender_type' => 'secretary',
                'sender_id' => 3,
                'message' => 'The baptism fee is ₱2,000 which includes the certificate and administrative costs. You can pay at the parish office or through our online payment system. Payment should be completed at least 3 days before the scheduled baptism.',
                'attachments' => null,
                'is_read' => true,
                'read_at' => Carbon::now()->subDays(6),
                'created_at' => Carbon::now()->subDays(6),
                'updated_at' => Carbon::now()->subDays(6)
            ]
        ];

        DB::table('messages')->insert($messages);
    }
}
