<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'name',
        'icon',
        'color',
        'description',
    ];

    /**
     * Get all categories for display
     */
    public static function getAllForDisplay()
    {
        return self::orderBy('name')->get();
    }
}
