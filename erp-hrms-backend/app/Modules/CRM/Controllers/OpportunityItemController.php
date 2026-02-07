<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Opportunity;
use App\Modules\CRM\Models\OpportunityItem;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OpportunityItemController extends Controller
{
    use ApiResponse;

    public function index(Opportunity $opportunity)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($opportunity->items);
    }

    public function store(Request $request, Opportunity $opportunity)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $request->except(['org_id', 'created_by']);
        $data['opportunity_id'] = $opportunity->id;
        $discount = $data['discount'] ?? 0;
        $data['total'] = ($data['quantity'] * $data['unit_price']) - $discount;

        $item = OpportunityItem::create($data);

        return $this->created($item, 'Item added successfully');
    }

    public function update(Request $request, Opportunity $opportunity, OpportunityItem $item)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'product_name' => 'sometimes|required|string|max:255',
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $request->except(['org_id', 'created_by']);
        $quantity = $data['quantity'] ?? $item->quantity;
        $unitPrice = $data['unit_price'] ?? $item->unit_price;
        $discount = $data['discount'] ?? $item->discount;
        $data['total'] = ($quantity * $unitPrice) - $discount;

        $item->update($data);

        return $this->success($item, 'Item updated successfully');
    }

    public function destroy(Opportunity $opportunity, OpportunityItem $item)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $item->delete();

        return $this->noContent('Item deleted successfully');
    }
}
