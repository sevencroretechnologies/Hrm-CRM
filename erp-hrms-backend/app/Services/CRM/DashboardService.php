<?php

namespace App\Services\CRM;

use App\Models\CRM\Appointment;
use App\Models\CRM\Contract;
use App\Models\CRM\Lead;
use App\Models\CRM\Opportunity;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(int $orgId): array
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        return [
            'leads' => [
                'total' => Lead::where('org_id', $orgId)->count(),
                'new_last_30_days' => Lead::where('org_id', $orgId)->where('created_at', '>=', $thirtyDaysAgo)->count(),
                'by_status' => Lead::where('org_id', $orgId)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->toArray(),
                'by_qualification' => Lead::where('org_id', $orgId)
                    ->select('qualification_status', DB::raw('count(*) as count'))
                    ->groupBy('qualification_status')
                    ->get()
                    ->toArray(),
            ],
            'opportunities' => [
                'total' => Opportunity::where('org_id', $orgId)->count(),
                'open' => Opportunity::where('org_id', $orgId)->where('status', 'Open')->count(),
                'won_last_30_days' => Opportunity::where('org_id', $orgId)
                    ->where('status', 'Converted')
                    ->where('updated_at', '>=', $thirtyDaysAgo)
                    ->count(),
                'total_value' => Opportunity::where('org_id', $orgId)->where('status', 'Open')->sum('opportunity_amount'),
                'by_status' => Opportunity::where('org_id', $orgId)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->toArray(),
                'by_stage' => Opportunity::where('opportunities.org_id', $orgId)
                    ->leftJoin('sales_stages', 'opportunities.sales_stage_id', '=', 'sales_stages.id')
                    ->select('sales_stages.stage_name as stage', DB::raw('count(*) as count'), DB::raw('sum(opportunity_amount) as value'))
                    ->groupBy('sales_stages.stage_name')
                    ->get(),
            ],
            'appointments' => [
                'total' => Appointment::where('org_id', $orgId)->count(),
                'upcoming' => Appointment::where('org_id', $orgId)
                    ->where('scheduled_time', '>=', $now)
                    ->where('status', 'Open')
                    ->count(),
            ],
            'contracts' => [
                'active' => Contract::where('org_id', $orgId)->where('status', 'Active')->count(),
                'unsigned' => Contract::where('org_id', $orgId)->where('status', 'Unsigned')->count(),
            ],
        ];
    }

    public function getLeadConversionFunnel(int $orgId): array
    {
        $total = Lead::where('org_id', $orgId)->count();
        $qualified = Lead::where('org_id', $orgId)->where('qualification_status', 'Qualified')->count();
        $converted = Lead::where('org_id', $orgId)->where('status', 'Converted')->count();
        $opportunity = Lead::where('org_id', $orgId)->where('status', 'Opportunity')->count();

        return [
            ['stage' => 'Total Leads', 'count' => $total],
            ['stage' => 'Qualified', 'count' => $qualified],
            ['stage' => 'Opportunity Created', 'count' => $opportunity],
            ['stage' => 'Converted', 'count' => $converted],
        ];
    }

    public function getOpportunityPipeline(int $orgId): array
    {
        return Opportunity::where('opportunities.org_id', $orgId)
            ->leftJoin('sales_stages', 'opportunities.sales_stage_id', '=', 'sales_stages.id')
            ->where('opportunities.status', 'Open')
            ->select(
                'sales_stages.stage_name as stage',
                DB::raw('count(*) as count'),
                DB::raw('sum(opportunity_amount) as total_value'),
                DB::raw('avg(probability) as avg_probability')
            )
            ->groupBy('sales_stages.stage_name')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }
}
