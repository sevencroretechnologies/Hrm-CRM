<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmNote;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrmNoteController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = CrmNote::forCurrentOrganization()->with(['creator']);

        if ($request->filled('notable_type') && $request->filled('notable_id')) {
            $query->where('notable_type', $request->notable_type)
                  ->where('notable_id', $request->notable_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $notes = $query->latest()->paginate($request->per_page ?? 15);

        return $this->success($notes);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notable_type' => 'nullable|string|max:255',
            'notable_id' => 'nullable|integer',
            'title' => 'nullable|string|max:255',
            'body' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $note = CrmNote::create($request->except(['org_id', 'created_by']));

        return $this->created($note->load('creator'), 'Note created successfully');
    }

    public function show(CrmNote $crmNote)
    {
        if ($crmNote->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($crmNote->load('creator'));
    }

    public function update(Request $request, CrmNote $crmNote)
    {
        if ($crmNote->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'body' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $crmNote->update($request->only(['title', 'body']));

        return $this->success($crmNote->load('creator'), 'Note updated successfully');
    }

    public function destroy(CrmNote $crmNote)
    {
        if ($crmNote->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $crmNote->delete();

        return $this->noContent('Note deleted successfully');
    }
}
