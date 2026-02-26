<?php

namespace App\Services\crm;

use App\Models\Lead;
use App\Models\Opportunity;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function getStats(): array
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Leads stats
        $leadsTotal = Lead::count();
        $leadsNew30 = Lead::where('created_at', '>=', $thirtyDaysAgo)->count();

        // Leads by status (join with statuses table to get the status name)
        $leadsByStatus = Lead::leftJoin('statuses', 'leads.status_id', '=', 'statuses.id')
            ->select('statuses.status_name as status', DB::raw('count(*) as count'))
            ->groupBy('statuses.status_name')
            ->get()
            ->toArray();

        // Leads by qualification
        $leadsByQualification = Lead::select('qualification_status', DB::raw('count(*) as count'))
            ->whereNotNull('qualification_status')
            ->groupBy('qualification_status')
            ->get()
            ->toArray();

        // Opportunities stats (join with statuses table for status filtering)
        $oppTotal = Opportunity::count();

        // Open opportunities - use status relationship
        $oppOpen = Opportunity::leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Open')
            ->count();

        $oppWon30 = Opportunity::leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Converted')
            ->where('opportunities.updated_at', '>=', $thirtyDaysAgo)
            ->count();

        $oppTotalValue = Opportunity::leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Open')
            ->sum('opportunities.opportunity_amount');

        $oppByStatus = Opportunity::leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->select('statuses.status_name as status', DB::raw('count(*) as count'))
            ->groupBy('statuses.status_name')
            ->get()
            ->toArray();

        // Opportunities by stage (use opportunity_stages table)
        $oppByStage = Opportunity::leftJoin('opportunity_stages', 'opportunities.opportunity_stage_id', '=', 'opportunity_stages.id')
            ->select(
                'opportunity_stages.name as stage_name',
                DB::raw('count(*) as count'),
                DB::raw('COALESCE(sum(opportunities.opportunity_amount), 0) as total_value')
            )
            ->groupBy('opportunity_stages.name')
            ->get()
            ->toArray();

        // Appointments - check if table exists
        $appointmentsTotal = 0;
        $appointmentsUpcoming = 0;
        if (Schema::hasTable('appointments')) {
            $appointmentsTotal = DB::table('appointments')->count();
            $appointmentsUpcoming = DB::table('appointments')
                ->where('scheduled_time', '>=', $now)
                ->where('status', 'Open')
                ->count();
        }

        // Contracts - check if table exists
        $contractsActive = 0;
        $contractsUnsigned = 0;
        if (Schema::hasTable('contracts')) {
            $contractsActive = DB::table('contracts')->where('status', 'Active')->count();
            if (Schema::hasColumn('contracts', 'is_signed')) {
                $contractsUnsigned = DB::table('contracts')->where('is_signed', false)->count();
            }
        }

        return [
            'leads' => [
                'total' => $leadsTotal,
                'new_last_30_days' => $leadsNew30,
                'by_status' => $leadsByStatus,
                'by_qualification' => $leadsByQualification,
            ],
            'opportunities' => [
                'total' => $oppTotal,
                'open' => $oppOpen,
                'won_last_30_days' => $oppWon30,
                'total_value' => $oppTotalValue,
                'by_status' => $oppByStatus,
                'by_stage' => $oppByStage,
            ],
            'appointments' => [
                'total' => $appointmentsTotal,
                'upcoming' => $appointmentsUpcoming,
            ],
            'contracts' => [
                'active' => $contractsActive,
                'unsigned' => $contractsUnsigned,
            ],
        ];
    }

    public function getLeadConversionFunnel(): array
    {
        $total = Lead::count();
        $qualified = Lead::where('qualification_status', 'Qualified')->count();

        // Count opportunities that originated from leads
        $withOpportunity = Opportunity::whereNotNull('lead_id')->distinct('lead_id')->count('lead_id');

        return [
            ['stage' => 'Total Leads', 'count' => $total],
            ['stage' => 'Qualified', 'count' => $qualified],
            ['stage' => 'Opportunity Created', 'count' => $withOpportunity],
        ];
    }

    public function getOpportunityPipeline(): array
    {
        return Opportunity::leftJoin('opportunity_stages', 'opportunities.opportunity_stage_id', '=', 'opportunity_stages.id')
            ->leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Open')
            ->select(
                'opportunity_stages.name as stage',
                DB::raw('count(*) as count'),
                DB::raw('COALESCE(sum(opportunities.opportunity_amount), 0) as total_value'),
                DB::raw('avg(opportunities.probability) as avg_probability')
            )
            ->groupBy('opportunity_stages.name')
            ->orderBy('count', 'desc')
            ->get()
            ->toArray();
    }
}
