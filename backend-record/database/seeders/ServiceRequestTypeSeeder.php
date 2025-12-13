<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceRequestType;
use Illuminate\Support\Facades\DB;

class ServiceRequestTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Check if types already exist
        if (DB::table('service_request_types')->count() > 0) {
            $this->command->info('Service request types already exist. Skipping...');
            return;
        }

        $types = [
            // SACRAMENT & SCHEDULE REQUESTS
            [
                'category' => 'Sacrament & Schedule',
                'type_code' => 'baptism_scheduling',
                'type_name' => 'Baptism Scheduling',
                'description' => 'Request to schedule a baptism ceremony. Provide baby details and preferred date.',
                'icon' => 'Baby',
                'required_fields' => json_encode(['baby_name', 'birth_date', 'parents_names', 'godparents_names', 'preferred_date']),
                'optional_fields' => json_encode(['special_requirements', 'contact_person']),
                'default_fee' => 3000.00,
                'requires_payment' => true,
                'requires_documents' => true,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'category' => 'Sacrament & Schedule',
                'type_code' => 'confirmation_scheduling',
                'type_name' => 'Confirmation Scheduling',
                'description' => 'Schedule confirmation ceremony for teens or adults.',
                'icon' => 'Cross',
                'required_fields' => json_encode(['candidate_name', 'birth_date', 'baptism_date', 'sponsor_name', 'preferred_date']),
                'optional_fields' => json_encode(['confirmation_name', 'special_notes']),
                'default_fee' => 2500.00,
                'requires_payment' => true,
                'requires_documents' => true,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'category' => 'Sacrament & Schedule',
                'type_code' => 'wedding_scheduling',
                'type_name' => 'Wedding Schedule Request',
                'description' => 'Request wedding ceremony schedule. Includes requirements checklist.',
                'icon' => 'Heart',
                'required_fields' => json_encode(['groom_name', 'bride_name', 'preferred_date', 'preferred_time', 'contact_numbers']),
                'optional_fields' => json_encode(['venue_preference', 'reception_details', 'special_requests']),
                'default_fee' => 15000.00,
                'requires_payment' => true,
                'requires_documents' => true,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'category' => 'Sacrament & Schedule',
                'type_code' => 'funeral_mass_scheduling',
                'type_name' => 'Funeral Mass Scheduling',
                'description' => 'Schedule funeral mass. Includes wake details and burial schedule.',
                'icon' => 'Cross',
                'required_fields' => json_encode(['deceased_name', 'date_of_death', 'wake_schedule', 'preferred_mass_date', 'burial_location']),
                'optional_fields' => json_encode(['family_contact', 'special_arrangements']),
                'default_fee' => 8000.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'category' => 'Sacrament & Schedule',
                'type_code' => 'mass_intention',
                'type_name' => 'Mass Intention Request',
                'description' => 'Request a mass intention for thanksgiving, petition, or in memory of loved ones.',
                'icon' => 'Church',
                'required_fields' => json_encode(['intention_for', 'intention_type', 'preferred_date', 'requestor_name']),
                'optional_fields' => json_encode(['special_message']),
                'default_fee' => 500.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => false,
                'is_active' => true,
                'display_order' => 5,
            ],

            // DOCUMENT UPLOAD OR PROFILE REQUESTS
            [
                'category' => 'Document Request',
                'type_code' => 'update_personal_info',
                'type_name' => 'Update Personal Information',
                'description' => 'Request to update name, address, contact details, or other personal information.',
                'icon' => 'UserEdit',
                'required_fields' => json_encode(['field_to_update', 'current_value', 'new_value', 'reason']),
                'optional_fields' => json_encode(['supporting_documents']),
                'default_fee' => 0.00,
                'requires_payment' => false,
                'requires_documents' => true,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 6,
            ],
            [
                'category' => 'Document Request',
                'type_code' => 'upload_missing_records',
                'type_name' => 'Upload Missing Records',
                'description' => 'Submit old certificates or records to be added to the digital system.',
                'icon' => 'Upload',
                'required_fields' => json_encode(['record_type', 'record_date', 'person_name']),
                'optional_fields' => json_encode(['additional_notes']),
                'default_fee' => 0.00,
                'requires_payment' => false,
                'requires_documents' => true,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 7,
            ],
            [
                'category' => 'Document Request',
                'type_code' => 'certificate_request',
                'type_name' => 'Certificate Request',
                'description' => 'Request baptismal, confirmation, marriage, or other church certificates.',
                'icon' => 'Award',
                'required_fields' => json_encode(['certificate_type', 'person_name', 'purpose']),
                'optional_fields' => json_encode(['delivery_method', 'urgent_request']),
                'default_fee' => 200.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 8,
            ],

            // FACILITY OR EVENT SERVICES
            [
                'category' => 'Facility & Event',
                'type_code' => 'venue_reservation',
                'type_name' => 'Venue Reservation',
                'description' => 'Reserve church hall, chapel, meeting room, or other parish facilities.',
                'icon' => 'Building',
                'required_fields' => json_encode(['venue_type', 'event_date', 'start_time', 'end_time', 'purpose', 'expected_attendees']),
                'optional_fields' => json_encode(['equipment_needed', 'setup_requirements']),
                'default_fee' => 5000.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 9,
            ],
            [
                'category' => 'Facility & Event',
                'type_code' => 'equipment_borrowing',
                'type_name' => 'Equipment Borrowing',
                'description' => 'Borrow church equipment such as chairs, tables, sound system, etc.',
                'icon' => 'Package',
                'required_fields' => json_encode(['equipment_items', 'quantity', 'borrow_date', 'return_date', 'purpose']),
                'optional_fields' => json_encode(['delivery_needed', 'special_instructions']),
                'default_fee' => 1000.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 10,
            ],
            [
                'category' => 'Facility & Event',
                'type_code' => 'event_request',
                'type_name' => 'Parish Event Request',
                'description' => 'Request to hold parish events or family events at church venue.',
                'icon' => 'Calendar',
                'required_fields' => json_encode(['event_name', 'event_type', 'event_date', 'expected_attendees', 'venue_needed']),
                'optional_fields' => json_encode(['budget', 'sponsors', 'program_details']),
                'default_fee' => 3000.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 11,
            ],
            [
                'category' => 'Facility & Event',
                'type_code' => 'blessing_request',
                'type_name' => 'House/Vehicle Blessing',
                'description' => 'Request blessing service for house, vehicle, business, or other property.',
                'icon' => 'Home',
                'required_fields' => json_encode(['blessing_type', 'location_address', 'preferred_date', 'preferred_time']),
                'optional_fields' => json_encode(['special_requests', 'contact_person']),
                'default_fee' => 2000.00,
                'requires_payment' => true,
                'requires_documents' => false,
                'requires_approval' => true,
                'is_active' => true,
                'display_order' => 12,
            ],
        ];

        foreach ($types as $type) {
            ServiceRequestType::create($type);
        }

        $this->command->info('✅ Service request types seeded successfully!');
    }
}
