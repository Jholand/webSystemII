<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventFeeCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Baptism', 'description' => 'Baptism ceremony fee', 'amount' => 500.00, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Wedding', 'description' => 'Wedding ceremony fee', 'amount' => 2000.00, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Funeral', 'description' => 'Funeral service fee', 'amount' => 1000.00, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Confirmation', 'description' => 'Confirmation ceremony fee', 'amount' => 300.00, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'First Communion', 'description' => 'First communion ceremony fee', 'amount' => 300.00, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Blessing', 'description' => 'House or vehicle blessing', 'amount' => 200.00, 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('event_fee_categories')->insert($categories);
    }
}
