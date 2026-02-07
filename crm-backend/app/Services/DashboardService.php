<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Appointment;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getStats(): array
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        return [
            'leads' => [
                'total' => Lead::count(),
                'new_last_30_days' => Lead::where('created_at', '>=', $thirtyDaysAgo)->count(),
                'by_status' => Lead::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->toArray(),
                'by_qualification' => Lead::select('qualification_status', DB::raw('count(*) as count'))
                    ->groupBy('qualification_status')
                    ->get()
                    ->toArray(),
            ],
            'opportunities' => [
                'total' => Opportunity::count(),
                'open' => Opportunity::where('status', 'Open')->count(),
                'won_last_30_days' => Opportunity::where('status', 'Converted')
                    ->where('updated_at', '>=', $thirtyDaysAgo)
                    ->count(),
                'total_value' => Opportunity::where('status', 'Open')->sum('opportunity_amount'),
                'by_status' => Opportunity::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->toArray(),
                'by_stage' => Opportunity::leftJoin('sales_stages', 'opportunities.sales_stage_id', '=', 'sales_stages.id')
                    ->select('sales_stages.stage_name as stage', DB::raw('count(*) as count'), DB::raw('sum(opportunity_amount) as value'))
                    ->groupBy('sales_stages.stage_name')
                    ->get(),
            ],
            'appointments' => [
                'total' => Appointment::count(),
                'upcoming' => Appointment::where('scheduled_time', '>=', $now)
                    ->where('status', 'Open')
                    ->count(),
            ],
            'contracts' => [
                'active' => Contract::where('status', 'Active')->count(),
                'unsigned' => Contract::where('status', 'Unsigned')->count(),
            ],
        ];
    }

    public function getLeadConversionFunnel(): array
    {
        $total = Lead::count();
        $qualified = Lead::where('qualification_status', 'Qualified')->count();
        $converted = Lead::where('status', 'Converted')->count();
        $opportunity = Lead::where('status', 'Opportunity')->count();

        return [
            ['stage' => 'Total Leads', 'count' => $total],
            ['stage' => 'Qualified', 'count' => $qualified],
            ['stage' => 'Opportunity Created', 'count' => $opportunity],
            ['stage' => 'Converted', 'count' => $converted],
        ];
    }

    public function getOpportunityPipeline(): array
    {
        return Opportunity::leftJoin('sales_stages', 'opportunities.sales_stage_id', '=', 'sales_stages.id')
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
