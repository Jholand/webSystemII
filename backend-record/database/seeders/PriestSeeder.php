<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PriestSeeder extends Seeder
{
    public function run(): void
    {
        // Check if priests already exist
        if (DB::table('priests')->count() > 0) {
            $this->command->info('Priests table already has data. Skipping...');
            return;
        }

        $priests = [
            [
                'name' => 'Fr. Joseph Smith',
                'email' => 'fr.joseph@church.com',
                'phone' => '09171234567',
                'ordained_date' => '2010-05-15',
                'specialty' => 'Wedding Ceremonies, Baptism',
                'status' => 'active',
                'bio' => 'Fr. Joseph has been serving the parish for over 10 years with dedication and passion.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'name' => 'Fr. Michael Chen',
                'email' => 'fr.michael@church.com',
                'phone' => '09187654321',
                'ordained_date' => '2015-08-22',
                'specialty' => 'Mass Intentions, Counseling',
                'status' => 'active',
                'bio' => 'Fr. Michael specializes in spiritual counseling and youth ministry.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'name' => 'Fr. David Santos',
                'email' => 'fr.david@church.com',
                'phone' => '09199876543',
                'ordained_date' => '2018-03-10',
                'specialty' => 'Funeral Services, Blessing',
                'status' => 'active',
                'bio' => 'Fr. David brings compassion and understanding to all funeral and blessing services.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'name' => 'Fr. Robert Garcia',
                'email' => 'fr.robert@church.com',
                'phone' => '09161234567',
                'ordained_date' => '2012-11-05',
                'specialty' => 'Confirmation, First Communion',
                'status' => 'active',
                'bio' => 'Fr. Robert has extensive experience in preparing youth for sacraments.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'name' => 'Fr. Thomas Lee',
                'email' => 'fr.thomas@church.com',
                'phone' => '09151112222',
                'ordained_date' => '2008-06-30',
                'specialty' => 'All Sacraments',
                'status' => 'inactive',
                'bio' => 'Fr. Thomas is currently on sabbatical for health reasons.',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        ];

        DB::table('priests')->insert($priests);
    }
}
