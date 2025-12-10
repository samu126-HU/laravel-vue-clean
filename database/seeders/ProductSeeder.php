<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // 🍺 24 Sör
            'Sör' => [
                ['name' => 'Arany Ászok Világos Lager', 'description' => 'Klasszikus magyar világos sör', 'price' => 299],
                ['name' => 'IPA India Pale Ale', 'description' => 'Komlós India Pale Ale', 'price' => 599],
                ['name' => 'Guinness Barna Sör', 'description' => 'Ír típusú barna ale', 'price' => 699],
                ['name' => 'Alkoholmentes Sör', 'description' => '0% alkohol tartalom', 'price' => 249],
                ['name' => 'Radler Meggyes', 'description' => 'Gyümölcsös sör meggyes ízesítéssel', 'price' => 329],
                ['name' => 'Weizen Búzasör', 'description' => 'Német stílusú búzasör', 'price' => 499],
            ],

            // 🥂 23 Bor, Pezsgő
            'Bor, Pezsgő' => [
                ['name' => 'Egri Bikavér', 'description' => 'Száraz vörösbor', 'price' => 1999],
                ['name' => 'Irsai Olivér', 'description' => 'Félédes fehérbor', 'price' => 1499],
                ['name' => 'Rosé Száraz', 'description' => 'Könnyű nyári bor', 'price' => 1799],
                ['name' => 'Pezsgő Brut', 'description' => 'Száraz pezsgő', 'price' => 2499],
                ['name' => 'Tokaji Aszú', 'description' => 'Édes desszertbor', 'price' => 4999],
                ['name' => 'Prosecco', 'description' => 'Olasz pezsgő', 'price' => 2199],
            ],

            // 💧 22/A Ásványvíz
            'Ásványvíz' => [
                ['name' => 'Szénsavmentes Ásványvíz 2L', 'description' => 'Nagy kiszerelés', 'price' => 129],
                ['name' => 'Enyhén Szénsavas Ásványvíz 0.5L', 'description' => 'Kis palack', 'price' => 99],
                ['name' => 'Ízesített Ásványvíz Citromos', 'description' => 'Természetes citrom ízesítés', 'price' => 149],
            ],

            // 💧 22/B Gyümölcslé
            'Gyümölcslé' => [
                ['name' => '100% Narancslé Hűtött', 'description' => 'Frissen préselt', 'price' => 699],
                ['name' => 'Almalé Premium', 'description' => 'Nem koncentrátumból', 'price' => 599],
                ['name' => 'Multivitamin Nektár', 'description' => 'Vegyes gyümölcsök', 'price' => 449],
            ],

            // 🧱 21 Csempe, Építőanyag
            'Csempe, Építőanyag' => [
                ['name' => 'Fali Csempe Fehér Fényes', 'description' => '20x20 cm', 'price' => 1999],
                ['name' => 'Padlólap Grez Matt Kültéri', 'description' => '30x30 cm', 'price' => 2499],
                ['name' => 'Dekorcsempe Mozaik', 'description' => 'Díszítőelem', 'price' => 3499],
                ['name' => 'Csemperagasztó Zsákos 25kg', 'description' => 'Profi ragasztó', 'price' => 2999],
                ['name' => 'Fugázó Anyag Szürke 5kg', 'description' => 'Vízálló fugázó', 'price' => 1499],
                ['name' => 'Burkolatváltó Profil Alumínium', 'description' => '2.5m', 'price' => 1299],
            ],

            // 🥤 20 Ízesített víz, Energiaital
            'Ízesített víz, Energiaital' => [
                ['name' => 'Kóla Szénsavas Üdítő', 'description' => '1.5L', 'price' => 349],
                ['name' => 'Izotóniás Sportital', 'description' => 'Elektrolit pótló', 'price' => 299],
                ['name' => 'Cukormentes Energiaital', 'description' => 'Magas koffeintartalom', 'price' => 399],
                ['name' => 'Málna Szörp', 'description' => 'Koncentrátum', 'price' => 599],
                ['name' => 'Ginger Ale Gyömbérsör', 'description' => 'Alkoholmentes', 'price' => 329],
                ['name' => 'Ice Tea Citromos', 'description' => '1.5L palack', 'price' => 399],
            ],

            // 🍿 19 Chips, Magvak
            'Chips, Magvak' => [
                ['name' => 'Sós Burgonyachips Hullámos', 'description' => '150g', 'price' => 449],
                ['name' => 'Paprikás Tortilla Chips', 'description' => '200g', 'price' => 499],
                ['name' => 'Pörkölt Földimogyoró Sózott', 'description' => '250g', 'price' => 599],
                ['name' => 'Napraforgómag Héjas Sózott', 'description' => '200g', 'price' => 399],
                ['name' => 'Kesudió Natúr', 'description' => '150g', 'price' => 1299],
                ['name' => 'Pálcikás Ropi', 'description' => '100g', 'price' => 299],
            ],

            // 🍪 18 Keksz, Édesség
            'Keksz, Édesség' => [
                ['name' => 'Oreo Kakaós Töltött Keksz', 'description' => '176g', 'price' => 599],
                ['name' => 'Omlós Vajas Keksz', 'description' => '200g', 'price' => 449],
                ['name' => 'Tejcsokoládé Egész Mogyorós', 'description' => '100g', 'price' => 599],
                ['name' => 'Gumicukor Gyümölcsös', 'description' => '150g', 'price' => 499],
                ['name' => 'Nápolyi Ostya', 'description' => 'Kakaós krémmel', 'price' => 399],
                ['name' => 'Müzliszelet Energiabár', 'description' => '6x25g', 'price' => 799],
            ],

            // ☕ 17 Kávé, Tea, Müzli
            'Kávé, Tea, Müzli' => [
                ['name' => 'Őrölt Pörkölt Kávé', 'description' => '250g standard', 'price' => 1299],
                ['name' => 'Instant Kávé Granulátum', 'description' => '100g', 'price' => 899],
                ['name' => 'Fekete Tea Filteres Reggeli', 'description' => '20 filter', 'price' => 499],
                ['name' => 'Gyümölcstea Erdei Gyümölcs', 'description' => '20 filter', 'price' => 599],
                ['name' => 'Ropogós Müzli Granola Mézes', 'description' => '500g', 'price' => 1199],
                ['name' => 'Zabpehely Natúr Nagy Szemű', 'description' => '500g', 'price' => 699],
            ],

            // 🍚 16 Puding, Liszt, Cukor, Nemzetközi
            'Puding, Liszt, Cukor, Nemzetközi' => [
                ['name' => 'Búza Finomliszt BL 55', 'description' => '1kg', 'price' => 349],
                ['name' => 'Kristálycukor', 'description' => '1kg', 'price' => 399],
                ['name' => 'Vaníliás Pudingpor', 'description' => '40g', 'price' => 199],
                ['name' => 'Vaníliás Cukor Tasak', 'description' => '10g', 'price' => 99],
                ['name' => 'Kókusztej Konzerv', 'description' => '400ml ázsiai konyha', 'price' => 699],
                ['name' => 'Taco Szósz Mexikói', 'description' => '230ml', 'price' => 799],
            ],

            // 🍝 15 Tészta, Rizs, Fűszer, Só, Leves
            'Tészta, Rizs, Fűszer, Só, Leves' => [
                ['name' => 'Durum Spagetti Száraztészta', 'description' => '500g', 'price' => 499],
                ['name' => 'A Rizs Hosszú Szemű', 'description' => '1kg', 'price' => 699],
                ['name' => 'Jódozott Konyhasó', 'description' => '1kg', 'price' => 199],
                ['name' => 'Őrölt Pirospaprika Édes', 'description' => '100g', 'price' => 599],
                ['name' => 'Vegeta Éti Fűszerkeverék', 'description' => '250g', 'price' => 799],
                ['name' => 'Instant Tyúkhúsleves Tasak', 'description' => '60g', 'price' => 299],
            ],

            // 🥫 14 Tej, Mártás, Konzerv, Hüvelyesek
            'Tej, Mártás, Konzerv, Hüvelyesek' => [
                ['name' => 'Tartós Tej 2.8%', 'description' => '1L', 'price' => 399],
                ['name' => 'Paradicsompüré Konzerv', 'description' => '400g', 'price' => 349],
                ['name' => 'Ketchup Flakon', 'description' => '500ml', 'price' => 599],
                ['name' => 'Vörösbab Konzerv', 'description' => '400g', 'price' => 299],
                ['name' => 'Zöldborsó Konzerv', 'description' => '400g', 'price' => 349],
                ['name' => 'Majonéz Üveges', 'description' => '400ml', 'price' => 699],
            ],

            // 🥛 13 Tej, Joghurt, Öntet
            'Tej, Joghurt, Öntet' => [
                ['name' => 'Friss Tej 1.5% Hűtött', 'description' => '1L', 'price' => 449],
                ['name' => 'Natúr Joghurt Kis Poharas', 'description' => '150g', 'price' => 129],
                ['name' => 'Gyümölcsjoghurt Ivójoghurt', 'description' => '500ml', 'price' => 399],
                ['name' => 'Tejföl 20%', 'description' => '330ml', 'price' => 349],
                ['name' => 'Kefir', 'description' => '500ml', 'price' => 399],
                ['name' => 'Salátaöntet Ezersziget', 'description' => '250ml', 'price' => 599],
            ],

            // 🧀 12 Csomagolt csemege, Vaj, Sajt
            'Csomagolt csemege, Vaj, Sajt' => [
                ['name' => 'Trappista Sajt Szeletelt', 'description' => '150g csomagolt', 'price' => 899],
                ['name' => 'Vaj Tégla', 'description' => '250g', 'price' => 1299],
                ['name' => 'Kenhető Sajt Natúr Doboz', 'description' => '140g', 'price' => 599],
                ['name' => 'Füstölt Szalámi Szeletelt', 'description' => '100g', 'price' => 999],
                ['name' => 'Párizsi Felvágott', 'description' => '150g', 'price' => 599],
                ['name' => 'Túró Zsíros', 'description' => '250g', 'price' => 499],
            ],

            // 🐕 11, 10 Állat
            'Állateledel' => [
                ['name' => 'Kutya Száraztáp Felnőtt Csirke', 'description' => '10kg', 'price' => 5999],
                ['name' => 'Macska Alutasak Tonhal', 'description' => '100g', 'price' => 249],
                ['name' => 'Kutya Jutalomfalat Csont', 'description' => '200g', 'price' => 799],
                ['name' => 'Macskaalom Csomósodó', 'description' => '5L', 'price' => 1499],
                ['name' => 'Aranyhal Táp Pelyhes', 'description' => '100g', 'price' => 599],
                ['name' => 'Hörcsög Eledel Magkeverék', 'description' => '500g', 'price' => 899],
            ],

            // 🧊 9 Mirelit
            'Mirelit' => [
                ['name' => 'Mirelit Hasábburgonya', 'description' => '1kg', 'price' => 799],
                ['name' => 'Mirelit Pizza Négy Sajtos', 'description' => '350g', 'price' => 1299],
                ['name' => 'Mirelit Csirke Nuggets', 'description' => '500g', 'price' => 1499],
                ['name' => 'Mirelit Spenót Krémsz', 'description' => '450g', 'price' => 599],
                ['name' => 'Mirelit Erdei Gyümölcs Mix', 'description' => '500g', 'price' => 1199],
                ['name' => 'Mirelit Leveles Tészta', 'description' => '400g', 'price' => 699],
            ],

            // 🧺 8 WC papír, Légtisztító
            'WC papír, Légtisztító' => [
                ['name' => 'WC Papír 3 Rétegű Illatos', 'description' => '8 tekercs', 'price' => 1499],
                ['name' => 'Légfrissítő Spray Virágillatú', 'description' => '300ml', 'price' => 799],
                ['name' => 'WC Ülőke Tisztító Kendő', 'description' => '40db', 'price' => 599],
                ['name' => 'Papírzsebkendő Dobozos', 'description' => '100db', 'price' => 399],
                ['name' => 'Nedves Törlőkendő Általános', 'description' => '60db', 'price' => 499],
                ['name' => 'Légfrissítő Automata Utántöltő', 'description' => '250ml', 'price' => 899],
            ],

            // 🍽️ 7 Mosogatószer, Konyhai tisztító
            'Mosogatószer, Konyhai tisztító' => [
                ['name' => 'Kézi Mosogatószer Citromos', 'description' => '1L', 'price' => 699],
                ['name' => 'Mosogatógép Tabletta', 'description' => '40db', 'price' => 2499],
                ['name' => 'Súrolókrém Általános', 'description' => '500ml', 'price' => 499],
                ['name' => 'Zsíroldó Spray Konyhai', 'description' => '750ml', 'price' => 999],
                ['name' => 'Ablaktisztító Folyadék', 'description' => '750ml', 'price' => 699],
                ['name' => 'Tisztítószer Klóros Fertőtlenítő', 'description' => '1L', 'price' => 799],
            ],

            // 👚 6 Öblítő, Mosószer
            'Öblítő, Mosószer' => [
                ['name' => 'Mosópor Fehér Ruhákhoz', 'description' => '3kg', 'price' => 2499],
                ['name' => 'Folyékony Mosószer Színes', 'description' => '2L', 'price' => 2799],
                ['name' => 'Öblítő Koncentrátum Tavaszi', 'description' => '1L', 'price' => 1299],
                ['name' => 'Folteltávolító Spray', 'description' => '500ml', 'price' => 999],
                ['name' => 'Mosószóda', 'description' => '500g', 'price' => 399],
                ['name' => 'Színfogó Kendő', 'description' => '20db', 'price' => 799],
            ],

            // 🧼 5 Szappan, Tusfürdő
            'Szappan, Tusfürdő' => [
                ['name' => 'Tömbszappan Natúr', 'description' => '90g', 'price' => 199],
                ['name' => 'Folyékony Szappan Utántöltő', 'description' => '1L', 'price' => 699],
                ['name' => 'Férfi Tusfürdő Mentolos', 'description' => '500ml', 'price' => 899],
                ['name' => 'Női Tusfürdő Krémes', 'description' => '500ml', 'price' => 999],
                ['name' => 'Habfürdő Nagy Kiszerelés', 'description' => '1L', 'price' => 1299],
                ['name' => 'Kézfertőtlenítő Gél', 'description' => '250ml', 'price' => 799],
            ],

            // 🧔 4 Arcápolás, Férfi dezodor
            'Arcápolás, Férfi dezodor' => [
                ['name' => 'Arckrém Hidratáló Nappali', 'description' => '50ml', 'price' => 1999],
                ['name' => 'Borotvahab', 'description' => '300ml', 'price' => 899],
                ['name' => 'Férfi Golyós Dezodor Sport', 'description' => '50ml', 'price' => 699],
                ['name' => 'Borotválkozás Utáni Arcszesz', 'description' => '100ml', 'price' => 1299],
                ['name' => 'Ajakápoló Stift', 'description' => '4.8g', 'price' => 499],
                ['name' => 'Arctisztító Micellás Víz', 'description' => '400ml', 'price' => 1499],
            ],

            // 💇 3 Sampon, Hajfesték
            'Sampon, Hajfesték' => [
                ['name' => 'Sampon Normál Hajra Családi', 'description' => '1L', 'price' => 1299],
                ['name' => 'Hajbalzsam Száraz Hajra', 'description' => '400ml', 'price' => 1499],
                ['name' => 'Tartós Hajfesték Középbarna', 'description' => '1 csomag', 'price' => 1999],
                ['name' => 'Hajlakk Extra Erős Tartás', 'description' => '400ml', 'price' => 1199],
                ['name' => 'Szárazsampon', 'description' => '200ml', 'price' => 1399],
                ['name' => 'Hajzselé Viasz', 'description' => '150ml', 'price' => 999],
            ],

            // 🩸 2 Női higiénia, Papírtörlő
            'Női higiénia, Papírtörlő' => [
                ['name' => 'Betét Normál Szárnyas', 'description' => '20db', 'price' => 799],
                ['name' => 'Tampon Normál', 'description' => '16db', 'price' => 899],
                ['name' => 'Papírtörlő Két Rétegű Tekercses', 'description' => '2 tekercs', 'price' => 599],
                ['name' => 'Intim Mosakodó', 'description' => '300ml', 'price' => 999],
                ['name' => 'Női Tisztasági Betét Mini', 'description' => '30db', 'price' => 599],
                ['name' => 'Nedves WC-papír', 'description' => '60db', 'price' => 699],
            ],

            // 👶 1 Baby
            'Baby' => [
                ['name' => 'Eldobható Pelenka Méret 4', 'description' => '50db', 'price' => 3999],
                ['name' => 'Baba Nedves Törlőkendő', 'description' => '80db illatmentes', 'price' => 799],
                ['name' => 'Bébiétel Gyümölcspüré 6hó+', 'description' => '190g', 'price' => 499],
                ['name' => 'Hintőpor', 'description' => '100g', 'price' => 899],
                ['name' => 'Babasampon és Fürdető', 'description' => '400ml', 'price' => 1299],
                ['name' => 'Pelenkakiütés Elleni Krém', 'description' => '75ml', 'price' => 1599],
            ],
        ];

        foreach ($products as $categoryName => $items) {
            $category = Category::where('name', $categoryName)->first();
            
            if (!$category) {
                $this->command->warn("Category '{$categoryName}' not found. Skipping products for this category.");
                continue;
            }

            foreach ($items as $productData) {
                Product::create([
                    'name' => $productData['name'],
                    'description' => $productData['description'],
                    'price' => $productData['price'],
                    'category_id' => $category->id,
                ]);
            }

            $this->command->info("Created " . count($items) . " products for category: {$categoryName}");
        }

        $this->command->info('Product seeding completed!');
    }
}
