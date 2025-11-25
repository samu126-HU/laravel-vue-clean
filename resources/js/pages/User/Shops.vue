<script setup>
import PageHead from '../../components/PageHead.vue';

const shops = [
    {
        id: 1,
        name: 'OBI',
        description: 'Építőanyag, szerszámok és kerti kellékek széles választéka.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Favoriten_%28Wien%29_-_OBI_Baumarkt.JPG'
    },
    {
        id: 2,
        name: 'Praktiker',
        description: 'Barkács- és lakberendezési áruház professzionális kiszolgálással.',
        image: 'https://www.lambda.hu/laravel-filemanager/photos/1/hirek/Praktiker/Praktiker-23496_11zon.jpg'
    },
    {
        id: 3,
        name: 'Bauhaus',
        description: 'Speciális szakáruház lakásfelújítási és kertészeti termékekkel.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1Z2VZaVoM9HzS2kjycx7vjwCLTM-MVcZBSQ&s'
    },
    {
        id: 4,
        name: 'Bricostore',
        description: 'Barkács és építőanyag kereskedés kedvező árakkal.',
        image: 'https://business-review.eu/wp-content/uploads/2014/03/Brico-Depot-Pantelimon.jpg'
    },
    {
        id: 5,
        name: 'Hornbach',
        description: 'Építőanyag-kereskedés és kertészeti centrum profi eszközökkel.',
        image: 'https://www.hornbach-holding.de/images/hornbach-holding-home-slider-1.jpg'
    },
    {
        id: 6,
        name: 'Kika',
        description: 'Bútorkereskedés és lakberendezési áruház inspiráló megoldásokkal.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Kika_Netanya_1.jpg'
    },
    {
        id: 7,
        name: 'Jysk',
        description: 'Skandináv stílusú bútorok és lakástextíliák megfizethető áron.',
        image: 'https://www.ersteingatlanalap.hu/content/dam/hu/eam/www_ersteingatlanalap_hu/Ingatlan_Alap/nfp_uzlet.jpg'
    },
    {
        id: 8,
        name: 'Pepco Home',
        description: 'Otthoni kiegészítők, dekorációk és praktikus háztartási termékek.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2WQ-r0gO-exiAnOr-mysl17W5WUbbD_p2UA&s'
    }
];
</script>

<template>
    <PageHead title="Shops" />

    <div class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            <div v-for="shop in shops" :key="shop.id" class="theme-background rounded-lg shadow p-4 flex flex-col">

                <div class="h-32 theme-surface rounded mb-4 flex items-center justify-center p-2">
                    <img :src="shop.image" :alt="shop.name" class="w-full h-full object-cover rounded" loading="lazy" />
                </div>

                <h3 class="text-lg font-semibold mb-2">{{ shop.name }}</h3>
                <p class="text-sm mb-4 flex-1">{{ shop.description }}</p>

                <div class="mt-auto flex items-center justify-end">
                    <button class="text-sm theme-text theme-btn-primary px-3 py-1 rounded">View</button>
                </div>

            </div>

            <!-- OLD CODE - TEMPORARILY HIDDEN
            <div v-for="n in 8" :key="n" class="theme-background rounded-lg shadow p-4 flex flex-col">

                <div class="h-32 theme-surface rounded mb-4 flex items-center justify-center theme-text">
                    Image
                </div>

                <h3 class="text-lg font-semibold mb-2">Shop {{ n }}</h3>
                <p class="text-sm mb-4 flex-1">Short description for shop {{ n }}.</p>

                <div class="mt-auto flex items-center justify-end">
                    <button class="text-sm theme-text theme-btn-primary px-3 py-1 rounded">View</button>
                </div>

            </div>
            -->

        </div>
    </div>

</template>