<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         $this->call(UsersTableSeeder::class);
         $this->call(OrganizationTableSeeder::class);
         $this->call(UserOrganizationTableSeeder::class);
         $this->call(WikiTableSeeder::class);
         $this->call(WikiPageTableSeeder::class);
         $this->call(UsersWatchTableSeeder::class);
         $this->call(UserStarTableSeeder::class);
         $this->call(CommentTableSeeder::class);
    }
}
