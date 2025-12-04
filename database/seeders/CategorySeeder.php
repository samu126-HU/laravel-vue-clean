<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Fruits & Vegetables', 'icon' => '🍎', 'color' => '#10b981', 'description' => 'Fresh produce'],
            ['name' => 'Dairy & Eggs', 'icon' => '🥛', 'color' => '#f59e0b', 'description' => 'Milk, cheese, yogurt, eggs'],
            ['name' => 'Meat & Seafood', 'icon' => '🥩', 'color' => '#ef4444', 'description' => 'Fresh meats and seafood'],
            ['name' => 'Bakery', 'icon' => '🍞', 'color' => '#f97316', 'description' => 'Bread, pastries, cakes'],
            ['name' => 'Beverages', 'icon' => '🥤', 'color' => '#3b82f6', 'description' => 'Drinks, juices, sodas'],
            ['name' => 'Snacks', 'icon' => '🍿', 'color' => '#eab308', 'description' => 'Chips, cookies, candy'],
            ['name' => 'Frozen Foods', 'icon' => '🧊', 'color' => '#06b6d4', 'description' => 'Frozen meals and ice cream'],
            ['name' => 'Pantry Staples', 'icon' => '🍝', 'color' => '#a855f7', 'description' => 'Pasta, rice, canned goods'],
            ['name' => 'Health & Beauty', 'icon' => '💄', 'color' => '#ec4899', 'description' => 'Cosmetics and personal care'],
            ['name' => 'Household', 'icon' => '🧹', 'color' => '#6366f1', 'description' => 'Cleaning supplies'],
            ['name' => 'Baby Products', 'icon' => '👶', 'color' => '#f472b6', 'description' => 'Diapers, formula, baby food'],
            ['name' => 'Pet Supplies', 'icon' => '🐾', 'color' => '#8b5cf6', 'description' => 'Pet food and accessories'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
