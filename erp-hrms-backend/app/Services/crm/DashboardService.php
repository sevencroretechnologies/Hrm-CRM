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
        $leadsTotal = Lead::forCurrentOrganization()->forCurrentCompany()->count();
        $leadsNew30 = Lead::forCurrentOrganization()->forCurrentCompany()->where('created_at', '>=', $thirtyDaysAgo)->count();

        // Leads by status (join with statuses table to get the status name)
        $leadsByStatus = DB::table('leads')
            ->leftJoin('statuses', 'leads.status_id', '=', 'statuses.id')
            ->where('leads.org_id', auth()->user()->org_id)
            ->where('leads.company_id', auth()->user()->company_id)
            ->whereNull('leads.deleted_at')
            ->select('statuses.status_name as status', DB::raw('count(*) as count'))
            ->groupBy('statuses.status_name')
            ->get()
            ->map(fn($item) => (array) $item)
            ->toArray();

        // Leads by qualification
        $leadsByQualification = DB::table('leads')
            ->where('org_id', auth()->user()->org_id)
            ->where('company_id', auth()->user()->company_id)
            ->whereNull('deleted_at')
            ->select('qualification_status', DB::raw('count(*) as count'))
            ->whereNotNull('qualification_status')
            ->groupBy('qualification_status')
            ->get()
            ->map(fn($item) => (array) $item)
            ->toArray();

        // Opportunities stats (join with statuses table for status filtering)
        $oppTotal = Opportunity::forCurrentOrganization()->forCurrentCompany()->count();

        // Open opportunities - use status relationship
        $oppOpen = Opportunity::forCurrentOrganization()->forCurrentCompany()
            ->leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Open')
            ->count();

        $oppWon30 = Opportunity::forCurrentOrganization()->forCurrentCompany()
            ->leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Converted')
            ->where('opportunities.updated_at', '>=', $thirtyDaysAgo)
            ->count();

        $oppTotalValue = Opportunity::forCurrentOrganization()->forCurrentCompany()
            ->leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('statuses.status_name', 'Open')
            ->sum('opportunities.opportunity_amount');

        $oppByStatus = DB::table('opportunities')
            ->leftJoin('statuses', 'opportunities.status_id', '=', 'statuses.id')
            ->where('opportunities.org_id', auth()->user()->org_id)
            ->whereNull('opportunities.deleted_at')
            ->select('statuses.status_name as status', DB::raw('count(*) as count'))
            ->groupBy('statuses.status_name')
            ->get()
            ->map(fn($item) => (array) $item)
            ->toArray();

        // Opportunities by stage (use opportunity_stages table)
        $oppByStage = DB::table('opportunities')
            ->leftJoin('opportunity_stages', 'opportunities.opportunity_stage_id', '=', 'opportunity_stages.id')
            ->where('opportunities.org_id', auth()->user()->org_id)
            ->whereNull('opportunities.deleted_at')
            ->select(
                'opportunity_stages.name as stage_name',
                DB::raw('count(*) as count'),
                DB::raw('COALESCE(sum(opportunities.opportunity_amount), 0) as total_value')
            )
            ->groupBy('opportunity_stages.name')
            ->get()
            ->map(fn($item) => (array) $item)
            ->toArray();

        // Appointments - check if table exists
        $appointmentsTotal = 0;
        $appointmentsUpcoming = 0;
        if (Schema::hasTable('appointments')) {
            $appointmentsTotal = DB::table('appointments')->where('org_id', auth()->user()->org_id)->count();
            $appointmentsUpcoming = DB::table('appointments')
                ->where('org_id', auth()->user()->org_id)
                ->where('scheduled_time', '>=', $now)
                ->where('status', 'Open')
                ->count();
        }

        // Contracts - check if table exists
        $contractsActive = 0;
        $contractsUnsigned = 0;
        if (Schema::hasTable('contracts')) {
            $contractsActive = DB::table('contracts')
                ->where('org_id', auth()->user()->org_id)
                ->where('status', 'Active')->count();
            if (Schema::hasColumn('contracts', 'is_signed')) {
                $contractsUnsigned = DB::table('contracts')
                    ->where('org_id', auth()->user()->org_id)
                    ->where('is_signed', false)->count();
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
                'lost_reasons' => DB::table('opportunity_lost_reasons')
                    ->where('org_id', auth()->user()->org_id)
                    ->whereNull('deleted_at')
                    ->select('opportunity_lost_reasons as reason', DB::raw('count(*) as count'))
                    ->groupBy('opportunity_lost_reasons')
                    ->get()
                    ->toArray(),
            ],
            'appointments' => [
                'total' => $appointmentsTotal,
                'upcoming' => $appointmentsUpcoming,
            ],
            'contracts' => [
                'active' => $contractsActive,
                'unsigned' => $contractsUnsigned,
            ],
            'customers' => [
                'total' => \App\Models\Customer::count(),
            ],
        ];
    }

    public function getLeadConversionFunnel(): array
    {
        $total = Lead::forCurrentOrganization()->forCurrentCompany()->count();
        $qualified = Lead::forCurrentOrganization()->forCurrentCompany()->where('qualification_status', 'Qualified')->count();

        // Count opportunities that originated from leads
        $withOpportunity = Opportunity::forCurrentOrganization()->forCurrentCompany()
            ->whereNotNull('lead_id')->distinct('lead_id')->count('lead_id');

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

    public function getSalesOverview(): array
    {
        $months = 7; // Show 7 months to match original design structure 
        $startDate = now()->subMonths($months - 1)->startOfMonth();

        // Fetch opportunities within the timeframe
        $opportunities = Opportunity::where('created_at', '>=', $startDate)
            ->get(['created_at', 'opportunity_amount']);

        $data = [];

        // Loop backwards to build chronological monthly data points
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthDate = now()->subMonths($i);
            $yearMonth = $monthDate->format('Y-m');
            $monthName = $monthDate->format('M'); // e.g. 'Jan', 'Feb'

            $monthOpps = $opportunities->filter(function ($opp) use ($yearMonth) {
                return $opp->created_at->format('Y-m') === $yearMonth;
            });

            $data[] = [
                'name' => $monthName,
                'revenue' => $monthOpps->sum('opportunity_amount'),
                'deals' => $monthOpps->count(),
            ];
        }

        return $data;
    }
}
