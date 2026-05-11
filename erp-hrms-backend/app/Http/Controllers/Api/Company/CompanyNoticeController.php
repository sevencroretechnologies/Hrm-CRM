<?php

namespace App\Http\Controllers\Api\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyNotice;
use App\Models\StaffMember;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompanyNoticeController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $staffMemberId = $this->currentStaffMemberId($request);

        $query = CompanyNotice::with(['author', 'recipients'])
            ->withCount([
                'recipients as recipients_count',
                'recipients as read_count' => function ($q) {
                    $q->where('company_notice_recipients.is_read', true);
                },
            ]);

        if ($request->boolean('active_only', false)) {
            $query->active();
        }
        if ($request->boolean('featured_only', false)) {
            $query->featured();
        }
        if ($request->boolean('unread_only', false) && $staffMemberId) {
            $query->whereHas('recipients', function ($q) use ($staffMemberId) {
                $q->where('staff_members.id', $staffMemberId)
                    ->where('company_notice_recipients.is_read', false);
            });
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        $notices = $request->boolean('paginate', true)
            ? $query->latest()->paginate($request->input('per_page', 15))
            : $query->latest()->get();

        $this->appendReadStatus($notices, $staffMemberId);

        return $this->success($notices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'publish_date' => 'required|date',
            'expire_date' => 'nullable|date|after:publish_date',
            'is_company_wide' => 'boolean',
            'is_featured' => 'boolean',
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'exists:staff_members,id',
        ]);

        $validated['author_id'] = $request->user()->id;
        $isCompanyWide = $validated['is_company_wide'] ?? true;

        $notice = DB::transaction(function () use ($validated, $isCompanyWide) {
            $notice = CompanyNotice::create(collect($validated)->except('recipient_ids')->toArray());

            $recipientIds = $isCompanyWide
                ? StaffMember::pluck('id')->toArray()
                : ($validated['recipient_ids'] ?? []);

            if (! empty($recipientIds)) {
                $notice->recipients()->attach(
                    $this->pivotPayload($recipientIds, $notice)
                );
            }

            return $notice;
        });

        $notice->loadCount([
            'recipients as recipients_count',
            'recipients as read_count' => function ($q) {
                $q->where('company_notice_recipients.is_read', true);
            },
        ]);

        return $this->created($notice->load(['author', 'recipients']), 'Company notice created');
    }

    public function show(Request $request, CompanyNotice $companyNotice)
    {
        $staffMemberId = $this->currentStaffMemberId($request);

        $companyNotice->load(['author', 'recipients'])->loadCount([
            'recipients as recipients_count',
            'recipients as read_count' => function ($q) {
                $q->where('company_notice_recipients.is_read', true);
            },
        ]);

        $this->appendReadStatus(collect([$companyNotice]), $staffMemberId);

        return $this->success($companyNotice);
    }

    public function update(Request $request, CompanyNotice $companyNotice)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'publish_date' => 'sometimes|required|date',
            'expire_date' => 'nullable|date',
            'is_company_wide' => 'boolean',
            'is_featured' => 'boolean',
            'recipient_ids' => 'nullable|array',
            'recipient_ids.*' => 'exists:staff_members,id',
        ]);

        DB::transaction(function () use ($companyNotice, $validated) {
            $companyNotice->update(collect($validated)->except('recipient_ids')->toArray());

            $isCompanyWide = \array_key_exists('is_company_wide', $validated)
                ? (bool) $validated['is_company_wide']
                : (bool) $companyNotice->is_company_wide;

            if ($isCompanyWide) {
                // For company-wide, ensure every staff member is a recipient
                // without resetting read status of existing recipients.
                $allStaffIds = StaffMember::pluck('id')->toArray();
                $companyNotice->recipients()->syncWithoutDetaching(
                    $this->pivotPayload($allStaffIds, $companyNotice)
                );
            } elseif (\array_key_exists('recipient_ids', $validated)) {
                $targetIds = $validated['recipient_ids'] ?? [];
                $existingIds = $companyNotice->recipients()->pluck('staff_members.id')->toArray();

                $toAttach = array_diff($targetIds, $existingIds);
                $toDetach = array_diff($existingIds, $targetIds);

                if (! empty($toAttach)) {
                    $companyNotice->recipients()->attach(
                        $this->pivotPayload($toAttach, $companyNotice)
                    );
                }
                if (! empty($toDetach)) {
                    $companyNotice->recipients()->detach($toDetach);
                }
            }
        });

        $fresh = $companyNotice->fresh(['author', 'recipients'])
            ->loadCount([
                'recipients as recipients_count',
                'recipients as read_count' => function ($q) {
                    $q->where('company_notice_recipients.is_read', true);
                },
            ]);

        return $this->success($fresh, 'Company notice updated');
    }

    /**
     * Mark notice as read for current user's staff member.
     */
    public function markAsRead(Request $request, CompanyNotice $companyNotice)
    {
        $staffMember = StaffMember::where('user_id', $request->user()->id)->first();

        if (! $staffMember) {
            return $this->error('Staff member not found', 404);
        }

        // Only allow marking as read for staff that should receive this notice.
        if (! $companyNotice->is_company_wide) {
            $isRecipient = $companyNotice->recipients()
                ->where('staff_members.id', $staffMember->id)
                ->exists();

            if (! $isRecipient) {
                return $this->error('You are not a recipient of this notice', 403);
            }
        }

        // syncWithoutDetaching inserts the pivot row if missing and updates it if present,
        // so this works whether or not the staff member was pre-attached.
        $companyNotice->recipients()->syncWithoutDetaching([
            $staffMember->id => [
                'is_read' => true,
                'read_at' => now(),
                'org_id' => $companyNotice->org_id,
                'company_id' => $companyNotice->company_id,
            ],
        ]);

        return $this->success([
            'notice_id' => $companyNotice->id,
            'is_read' => true,
            'read_at' => now()->toIso8601String(),
        ], 'Notice marked as read');
    }

    public function destroy(CompanyNotice $companyNotice)
    {
        $companyNotice->delete();

        return $this->noContent('Company notice deleted');
    }

    /**
     * Build a pivot payload [staff_id => [org_id, company_id]] so attach/sync
     * persists the tenant scope columns on company_notice_recipients.
     */
    private function pivotPayload(array $staffIds, CompanyNotice $notice): array
    {
        $base = [
            'org_id' => $notice->org_id,
            'company_id' => $notice->company_id,
        ];

        $payload = [];
        foreach ($staffIds as $id) {
            $payload[$id] = $base;
        }

        return $payload;
    }

    private function currentStaffMemberId(Request $request): ?int
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        return StaffMember::where('user_id', $user->id)->value('id');
    }

    private function appendReadStatus($notices, ?int $staffMemberId): void
    {
        $collection = method_exists($notices, 'getCollection')
            ? $notices->getCollection()
            : collect($notices);

        foreach ($collection as $notice) {
            $pivot = $staffMemberId
                ? optional($notice->recipients->firstWhere('id', $staffMemberId))->pivot
                : null;

            $notice->setAttribute('is_read', $pivot ? (bool) $pivot->is_read : false);
            $notice->setAttribute('read_at', $pivot?->read_at);
        }
    }
}
