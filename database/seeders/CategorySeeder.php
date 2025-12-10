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
            // Aisle 24-23
            ['name' => 'Sör', 'icon' => '🍺', 'color' => '#f59e0b', 'description' => 'Különféle sörök'],
            ['name' => 'Bor, Pezsgő', 'icon' => '🥂', 'color' => '#dc2626', 'description' => 'Borok és pezsgők'],
            
            // Aisle 22
            ['name' => 'Ásványvíz', 'icon' => '💧', 'color' => '#3b82f6', 'description' => 'Ásványvizek'],
            ['name' => 'Gyümölcslé', 'icon' => '🧃', 'color' => '#f97316', 'description' => 'Gyümölcslevek'],
            
            // Aisle 21
            ['name' => 'Csempe, Építőanyag', 'icon' => '🧱', 'color' => '#78716c', 'description' => 'Építési anyagok'],
            
            // Aisle 20
            ['name' => 'Ízesített víz, Energiaital', 'icon' => '🥤', 'color' => '#06b6d4', 'description' => 'Üdítők és energiaitalok'],
            
            // Aisle 19-18
            ['name' => 'Chips, Magvak', 'icon' => '🍿', 'color' => '#eab308', 'description' => 'Rágcsálnivalók'],
            ['name' => 'Keksz, Édesség', 'icon' => '🍪', 'color' => '#f472b6', 'description' => 'Édességek'],
            
            // Aisle 17
            ['name' => 'Kávé, Tea, Müzli', 'icon' => '☕', 'color' => '#78350f', 'description' => 'Reggeli italok és gabonák'],
            
            // Aisle 16
            ['name' => 'Puding, Liszt, Cukor, Nemzetközi', 'icon' => '🍚', 'color' => '#a855f7', 'description' => 'Alapanyagok és nemzetközi termékek'],
            
            // Aisle 15
            ['name' => 'Tészta, Rizs, Fűszer, Só, Leves', 'icon' => '🍝', 'color' => '#8b5cf6', 'description' => 'Száraz alapanyagok'],
            
            // Aisle 14
            ['name' => 'Tej, Mártás, Konzerv, Hüvelyesek', 'icon' => '🥫', 'color' => '#14b8a6', 'description' => 'Tartós élelmiszerek'],
            
            // Aisle 13
            ['name' => 'Tej, Joghurt, Öntet', 'icon' => '🥛', 'color' => '#60a5fa', 'description' => 'Tejtermékek'],
            
            // Aisle 12
            ['name' => 'Csomagolt csemege, Vaj, Sajt', 'icon' => '🧀', 'color' => '#fbbf24', 'description' => 'Sajtok és felvágottak'],
            
            // Aisle 11, 10
            ['name' => 'Állateledel', 'icon' => '🐕', 'color' => '#8b5cf6', 'description' => 'Kisállat termékek'],
            
            // Aisle 9
            ['name' => 'Mirelit', 'icon' => '🧊', 'color' => '#06b6d4', 'description' => 'Fagyasztott termékek'],
            
            // Aisle 8
            ['name' => 'WC papír, Légtisztító', 'icon' => '🧺', 'color' => '#84cc16', 'description' => 'WC termékek és légfrissítők'],
            
            // Aisle 7
            ['name' => 'Mosogatószer, Konyhai tisztító', 'icon' => '🍽️', 'color' => '#10b981', 'description' => 'Konyhai tisztítószerek'],
            
            // Aisle 6
            ['name' => 'Öblítő, Mosószer', 'icon' => '👚', 'color' => '#3b82f6', 'description' => 'Mosási termékek'],
            
            // Aisle 5
            ['name' => 'Szappan, Tusfürdő', 'icon' => '🧼', 'color' => '#ec4899', 'description' => 'Fürdőszobai termékek'],
            
            // Aisle 4
            ['name' => 'Arcápolás, Férfi dezodor', 'icon' => '🧔', 'color' => '#6366f1', 'description' => 'Férfi ápolás'],
            
            // Aisle 3
            ['name' => 'Sampon, Hajfesték', 'icon' => '💇', 'color' => '#a855f7', 'description' => 'Hajápolás'],
            
            // Aisle 2
            ['name' => 'Női higiénia, Papírtörlő', 'icon' => '🩸', 'color' => '#f472b6', 'description' => 'Női higiéniai termékek'],
            
            // Aisle 1
            ['name' => 'Baby', 'icon' => '👶', 'color' => '#fbbf24', 'description' => 'Baba termékek'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
