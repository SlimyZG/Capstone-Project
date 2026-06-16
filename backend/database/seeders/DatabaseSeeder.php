<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Admin
        User::factory()->create([
            'name'     => 'System Admin',
            'email'    => 'admin@admin.com',
            'password' => Hash::make('admin12345678'),
            'role'     => 'admin',
        ]);

        // 2. Create Departments
        $departments = [
            ['name' => 'Business and Accountancy', 'slug' => 'business-accountancy'],
            ['name' => 'Computer Studies', 'slug' => 'computer-studies'],
            ['name' => 'Criminology', 'slug' => 'criminology'],
            ['name' => 'Customs Administration', 'slug' => 'customs-administration'],
            ['name' => 'Engineering', 'slug' => 'engineering'],
            ['name' => 'Hospitality and Tourism Management', 'slug' => 'hospitality-tourism'],
            ['name' => 'Nursing', 'slug' => 'nursing'],
            ['name' => 'Teacher Education', 'slug' => 'teacher-education'],
            ['name' => 'Maritime Studies', 'slug' => 'maritime-studies'],
            ['name' => 'Basic Education', 'slug' => 'basic-education'],
        ];

        foreach ($departments as $dept) {
            $department = \App\Models\Department::create($dept);

            // 3. Create Department User
            User::factory()->create([
                'name'          => $dept['name'] . ' Rep',
                'email'         => $dept['slug'] . '@unicomplaints.local',
                'password'      => Hash::make('password'),
                'role'          => 'department',
                'department_id' => $department->id,
            ]);
        }

        // 4. Create Students
        $students = User::factory(10)->create([
            'password' => Hash::make('password'),
            'role'     => 'student',
        ]);

        // 5. Create Sample Complaints
        $allDepartments = \App\Models\Department::all();
        $statuses = ['pending', 'investigating', 'resolved', 'closed'];

        foreach ($students as $student) {
            for ($i = 0; $i < 3; $i++) {
                $isAnonymous = rand(0, 1) === 1;

                $complaint = \App\Models\Complaint::create([
                    'user_id'       => $isAnonymous ? null : $student->id,
                    'department_id' => $allDepartments->random()->id,
                    'title'         => 'Sample Complaint ' . rand(100, 999),
                    'body'          => "This is a detailed description of the sample complaint submitted by a student. It outlines the issue they encountered and provides context for the department to investigate.",
                    'status'        => $statuses[array_rand($statuses)],
                    'is_anonymous'  => $isAnonymous,
                    'created_at'    => now()->subDays(rand(1, 30)),
                ]);

                // Upvotes
                if (rand(0, 1) === 1) {
                    \App\Models\Upvote::create([
                        'complaint_id' => $complaint->id,
                        'user_id'      => $students->random()->id,
                    ]);
                    $complaint->increment('upvotes_count');
                }
            }
        }
    }
}
