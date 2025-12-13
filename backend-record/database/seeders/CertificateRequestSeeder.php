<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CertificateRequest;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class CertificateRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a regular user (role = 'user')
        $user = User::where('role', 'user')->first();
        
        if (!$user) {
            $this->command->error('No regular user found. Please create a user first.');
            return;
        }

        // Create sample documents directory if it doesn't exist
        Storage::disk('public')->makeDirectory('certificate_documents');

        // Sample certificate requests with mock documents
        $requests = [
            [
                'user_id' => $user->id,
                'certificate_type' => 'baptism',
                'purpose' => 'School Requirement',
                'details' => 'Needed for enrollment in St. Mary\'s Catholic School',
                'status' => 'pending',
                'certificate_fee' => 50.00,
                'payment_status' => 'unpaid',
                'supporting_documents' => [
                    [
                        'original_name' => 'birth_certificate.pdf',
                        'filename' => 'sample_birth_cert_' . time() . '.pdf',
                        'path' => 'certificate_documents/sample_birth_cert_' . time() . '.pdf',
                        'size' => 245678,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                    [
                        'original_name' => 'valid_id.jpg',
                        'filename' => 'sample_id_' . time() . '.jpg',
                        'path' => 'certificate_documents/sample_id_' . time() . '.jpg',
                        'size' => 156789,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                ],
            ],
            [
                'user_id' => $user->id,
                'certificate_type' => 'marriage',
                'purpose' => 'Legal Documentation',
                'details' => 'Required for visa application',
                'status' => 'processing',
                'certificate_fee' => 50.00,
                'payment_status' => 'paid',
                'paid_at' => now(),
                'supporting_documents' => [
                    [
                        'original_name' => 'marriage_contract.pdf',
                        'filename' => 'sample_marriage_' . time() . '.pdf',
                        'path' => 'certificate_documents/sample_marriage_' . time() . '.pdf',
                        'size' => 389456,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                ],
            ],
            [
                'user_id' => $user->id,
                'certificate_type' => 'confirmation',
                'purpose' => 'Employment Requirement',
                'details' => 'New job at Catholic organization',
                'status' => 'approved',
                'certificate_fee' => 50.00,
                'payment_status' => 'waived',
                'paid_at' => now(),
                'supporting_documents' => [
                    [
                        'original_name' => 'confirmation_record.pdf',
                        'filename' => 'sample_confirmation_' . time() . '.pdf',
                        'path' => 'certificate_documents/sample_confirmation_' . time() . '.pdf',
                        'size' => 198234,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                    [
                        'original_name' => 'baptismal_certificate.pdf',
                        'filename' => 'sample_baptismal_' . time() . '.pdf',
                        'path' => 'certificate_documents/sample_baptismal_' . time() . '.pdf',
                        'size' => 223456,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                    [
                        'original_name' => 'photo_id.png',
                        'filename' => 'sample_photo_' . time() . '.png',
                        'path' => 'certificate_documents/sample_photo_' . time() . '.png',
                        'size' => 445678,
                        'uploaded_at' => now()->toDateTimeString(),
                    ],
                ],
            ],
            [
                'user_id' => $user->id,
                'certificate_type' => 'baptism',
                'purpose' => 'Travel Documentation',
                'details' => null,
                'status' => 'pending',
                'certificate_fee' => 50.00,
                'payment_status' => 'unpaid',
                'supporting_documents' => null, // Request without documents
            ],
        ];

        foreach ($requests as $requestData) {
            CertificateRequest::create($requestData);
        }

        $this->command->info('Certificate requests seeded successfully!');
        $this->command->info('Total requests created: ' . count($requests));
        $this->command->info('Note: Actual document files are not created, only database records with mock file information.');
    }
}
