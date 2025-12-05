<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'map_data',
        'aisle_names',
        'aisle_categories',
        'shelf_access_points',
    ];

    protected $casts = [
        'map_data' => 'array',
        'aisle_names' => 'array',
        'aisle_categories' => 'array',
        'shelf_access_points' => 'array',
    ];

    /**
     * Get the map data as an array
     */
    public function getMapData(): ?array
    {
        return $this->map_data;
    }

    /**
     * Set the map data from ShopMap.toJSON() output
     */
    public function setMapData(array $mapData): void
    {
        $this->map_data = $mapData;
    }
}
