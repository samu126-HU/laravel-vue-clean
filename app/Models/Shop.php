<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'address',
        'map_data',
        'aisle_names',
        'aisle_categories',
        'shelf_access_points',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'map_data' => 'array',
            'aisle_names' => 'array',
            'aisle_categories' => 'array',
            'shelf_access_points' => 'array',
        ];
    }

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

    /**
     * Scope to eager load products relationship
     */
    public function scopeWithProducts($query)
    {
        return $query->with('products');
    }

    /**
     * Get the products for this shop
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
