<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create/update users - check both email and username to avoid conflicts
        $users = [
            ['email' => 'admin@church.com', 'username' => 'admin', 'name' => 'System Administrator', 'role' => 'admin'],
            ['email' => 'accountant@church.com', 'username' => 'accountant', 'name' => 'Church Accountant', 'role' => 'accountant'],
            ['email' => 'churchadmin@church.com', 'username' => 'churchadmin', 'name' => 'Church Administrator', 'role' => 'church-admin'],
            ['email' => 'priest@church.com', 'username' => 'priest', 'name' => 'Fr. Joseph Smith', 'role' => 'priest'],
            ['email' => 'user@church.com', 'username' => 'user', 'name' => 'John Doe', 'role' => 'user'],
        ];

        foreach ($users as $userData) {
            if (!User::where('email', $userData['email'])->orWhere('username', $userData['username'])->exists()) {
                User::create([
                    'email' => $userData['email'],
                    'username' => $userData['username'],
                    'name' => $userData['name'],
                    'role' => $userData['role'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'Active',
                ]);
            }
        }

        $this->command->info('Users created/verified successfully!');

        // Call other seeders only if tables are empty
        if (\DB::table('donation_categories')->count() == 0) {
            $this->call(DonationCategorySeeder::class);
        }
        if (\DB::table('event_fee_categories')->count() == 0) {
            $this->call(EventFeeCategorySeeder::class);
        }
        
        $this->call([
            // Core data
            PriestSeeder::class,
            MemberSeeder::class,
            
            // Schedules and Events
            ScheduleSeeder::class,
            EventSeeder::class,
            AnnouncementSeeder::class,
            
            // Records
            MarriageRecordSeeder::class,
            BaptismRecordSeeder::class,
            BirthRecordSeeder::class,
            
            // Financial
            DonationSeeder::class,
            PaymentRecordSeeder::class,
            
            // Appointments and Services
            AppointmentSeeder::class,
            ServiceRequestSeeder::class,
            CertificateRequestSeeder::class,
            
            // User Management
            CorrectionRequestSeeder::class,
            MessageSeeder::class,
            
            // System
            AuditLogSeeder::class,
        ]);
        
        $this->command->info('✅ All test data seeded successfully!');
        $this->command->info('📧 Login credentials:');
        $this->command->info('   Admin: admin@church.com / password');
        $this->command->info('   Accountant: accountant@church.com / password');
        $this->command->info('   Church Admin: churchadmin@church.com / password');
        $this->command->info('   Priest: priest@church.com / password');
        $this->command->info('   User: user@church.com / password');
    }
}