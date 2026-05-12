<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\ContractRenewal;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ContractController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Contract::with(['staffMember', 'contractType']);

        // Status filter — "expired" and "active" are derived from end_date rather than the
        // raw column, so a "draft" contract whose end_date has passed still appears in the
        // Expired bucket, and an "active" contract whose end_date is in the past does not.
        if ($request->status) {
            $today = now()->toDateString();
            switch ($request->status) {
                case 'expired':
                    $query->whereDate('end_date', '<', $today)
                        ->where('status', '!=', 'terminated');
                    break;
                case 'active':
                    $query->where('status', 'active')
                        ->whereDate('end_date', '>=', $today);
                    break;
                default:
                    $query->where('status', $request->status);
            }
        }
        if ($request->staff_member_id) {
            $query->where('staff_member_id', $request->staff_member_id);
        }

        // Search support
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('staffMember', function ($q2) use ($search) {
                        $q2->where('full_name', 'like', "%{$search}%");
                    });
            });
        }

        // Sorting support
        if ($request->filled('order_by')) {
            $direction = $request->input('order', 'asc');
            $orderBy = $request->input('order_by');
            
            // Handle sorting by staff member name
            if ($orderBy === 'staff_member_id') {
                $query->join('staff_members', 'contracts.staff_member_id', '=', 'staff_members.id')
                    ->orderBy('staff_members.full_name', $direction)
                    ->select('contracts.*');
            } else {
                $query->orderBy($orderBy, $direction);
            }
        } else {
            $query->latest();
        }

        $contracts = $query->paginate($request->per_page ?? 15);

        return $this->success($contracts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_member_id' => 'required|exists:staff_members,id',
            'contract_type_id' => 'nullable|exists:contract_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'salary' => 'nullable|numeric|min:0',
            'terms' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $request->all();
        $data['reference_number'] = 'CTR-'.strtoupper(Str::random(8));
        $data['status'] = 'draft';

        $contract = Contract::create($data);

        return $this->created($contract->load(['staffMember', 'contractType']), 'Contract created');

        return $this->success($contract);
    }

    public function update(Request $request, Contract $contract)
    {
        $validator = Validator::make($request->all(), [
            'salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:draft,active,expired,terminated',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'terms' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $contract->update($request->only([
            'salary',
            'status',
            'start_date',
            'end_date',
            'terms',
        ]));

        return $this->success($contract->load(['staffMember', 'contractType']), 'Contract updated successfully');
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();

        return $this->noContent('Deleted');
    }

    public function renew(Request $request, Contract $contract)
    {
        $validator = Validator::make($request->all(), [
            'new_end_date' => 'required|date|after:'.$contract->end_date,
            'new_salary' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        ContractRenewal::create([
            'contract_id' => $contract->id,
            'old_end_date' => $contract->end_date,
            'new_end_date' => $request->new_end_date,
            'new_salary' => $request->new_salary,
            'notes' => $request->notes,
            'renewed_by' => auth()->id(),
            'renewed_at' => now(),
        ]);

        $contract->update([
            'end_date' => $request->new_end_date,
            'salary' => $request->new_salary ?? $contract->salary,
            'status' => 'active',
        ]);

        return $this->success($contract->load('renewals'), 'Contract renewed');
    }

    public function terminate(Request $request, Contract $contract)
    {
        $contract->update(['status' => 'terminated']);

        return $this->success($contract, 'Contract terminated');
    }

    public function expiring(Request $request)
    {
        $days = $request->days ?? 30;
        $contracts = Contract::expiringSoon($days)->with(['staffMember', 'contractType'])->get();

        return $this->success($contracts);
    }

    public function byEmployee($staffMemberId)
    {
        $contracts = Contract::where('staff_member_id', $staffMemberId)
            ->with('contractType')
            ->orderBy('start_date', 'desc')
            ->get();

        return $this->success($contracts);
    }
}
