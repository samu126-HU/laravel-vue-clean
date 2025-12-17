<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateShopRequest;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Shop::query();

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $shops = $query->orderBy('name')->paginate(10);

        return response()->json($shops);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'address' => 'nullable|string|max:500',
            'map_data' => 'nullable|array',
            'aisle_names' => 'nullable|array',
            'aisle_categories' => 'nullable|array',
            'shelf_access_points' => 'nullable|array'
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'message' => 'Shop created successfully',
            'shop' => $shop
        ], 201);
    }

    public function update(UpdateShopRequest $request, Shop $shop): JsonResponse
    {
        $shop->update($request->validated());
        $shop->refresh();

        return response()->json([
            'message' => 'Shop updated successfully',
            'shop' => $shop
        ]);
    }

    public function destroy(Shop $shop): JsonResponse
    {
        $shop->delete();

        return response()->json([
            'message' => 'Shop deleted successfully'
        ]);
    }

    public function uploadDxf(Request $request, Shop $shop): JsonResponse
    {
        $request->validate([
            'dxf_file' => 'required|file|max:10240'
        ]);

        try {
            $file = $request->file('dxf_file');
            
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension !== 'dxf') {
                return response()->json([
                    'message' => 'Invalid file type. Please upload a .dxf file.',
                    'error' => 'Only DXF files are allowed'
                ], 422);
            }
            
            $content = file_get_contents($file->getRealPath());
            $mapData = $this->parseDxf($content);

            $shop->update([
                'map_data' => json_encode($mapData)
            ]);

            return response()->json([
                'message' => 'DXF file uploaded and processed successfully',
                'map_data' => $mapData
            ]);
        } catch (\Exception $e) {
            Log::error('DXF upload failed', [
                'shop_id' => $shop->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to process DXF file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function parseDxf($content)
    {
        // Basic DXF parser - extracts LINE and POLYLINE entities
        $lines = explode("\n", $content);
        $entities = [
            'lines' => [],
            'polylines' => [],
            'shelves' => []
        ];
        
        $bounds = [
            'minX' => PHP_FLOAT_MAX,
            'minY' => PHP_FLOAT_MAX,
            'maxX' => PHP_FLOAT_MIN,
            'maxY' => PHP_FLOAT_MIN
        ];

        $inEntitiesSection = false;
        $currentEntity = null;
        $currentData = [];

        for ($i = 0; $i < count($lines); $i++) {
            $line = trim($lines[$i]);

            // Check for ENTITIES section
            if ($line === 'ENTITIES') {
                $inEntitiesSection = true;
                continue;
            }

            if ($line === 'ENDSEC') {
                $inEntitiesSection = false;
                continue;
            }

            if (!$inEntitiesSection) continue;

            // Start of entity
            if ($line === '0') {
                // Save previous entity
                if ($currentEntity === 'LINE' && isset($currentData['x1'])) {
                    $entities['lines'][] = $currentData;
                    $this->updateBounds($bounds, $currentData['x1'], $currentData['y1']);
                    $this->updateBounds($bounds, $currentData['x2'], $currentData['y2']);
                } elseif ($currentEntity === 'POLYLINE' && !empty($currentData['vertices'])) {
                    $entities['polylines'][] = $currentData;
                    foreach ($currentData['vertices'] as $vertex) {
                        $this->updateBounds($bounds, $vertex['x'], $vertex['y']);
                    }
                }

                // Reset for next entity
                $currentData = [];
                $currentEntity = isset($lines[$i + 1]) ? trim($lines[$i + 1]) : null;
                $i++;
                continue;
            }

            // Parse LINE entity
            if ($currentEntity === 'LINE') {
                if ($line === '10') {
                    $currentData['x1'] = (float) trim($lines[++$i]);
                } elseif ($line === '20') {
                    $currentData['y1'] = (float) trim($lines[++$i]);
                } elseif ($line === '11') {
                    $currentData['x2'] = (float) trim($lines[++$i]);
                } elseif ($line === '21') {
                    $currentData['y2'] = (float) trim($lines[++$i]);
                } elseif ($line === '8') {
                    $currentData['layer'] = trim($lines[++$i]);
                }
            }

            // Parse POLYLINE entity
            if ($currentEntity === 'POLYLINE') {
                if ($line === '8') {
                    $currentData['layer'] = trim($lines[++$i]);
                    $currentData['vertices'] = [];
                }
            }

            // Parse VERTEX (part of POLYLINE)
            if ($currentEntity === 'VERTEX') {
                if ($line === '10') {
                    $x = (float) trim($lines[++$i]);
                } elseif ($line === '20') {
                    $y = (float) trim($lines[++$i]);
                    if (isset($x)) {
                        // Add to last polyline
                        if (!empty($entities['polylines'])) {
                            $lastIndex = count($entities['polylines']) - 1;
                            $entities['polylines'][$lastIndex]['vertices'][] = ['x' => $x, 'y' => $y];
                        }
                    }
                }
            }
        }

        return [
            'bounds' => $bounds,
            'entities' => $entities
        ];
    }

    private function updateBounds(&$bounds, $x, $y)
    {
        $bounds['minX'] = min($bounds['minX'], $x);
        $bounds['minY'] = min($bounds['minY'], $y);
        $bounds['maxX'] = max($bounds['maxX'], $x);
        $bounds['maxY'] = max($bounds['maxY'], $y);
    }
}
