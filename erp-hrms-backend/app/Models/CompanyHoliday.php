<?php

namespace App\Models;

use App\Traits\HasOrgAndCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanyHoliday extends Model
{
    use HasFactory, HasOrgAndCompany, SoftDeletes;

    protected $fillable = [
        'title',
        'holiday_date',
        'notes',
        'is_recurring',
        'tenant_id',
    ];

    protected $casts = [
        'holiday_date' => 'date',
        'is_recurring' => 'boolean',
    ];

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('holiday_date', '>=', now())
            ->orderBy('holiday_date');
    }

    public function scopeForYear($query, $year)
    {
        return $query->whereYear('holiday_date', $year);
    }

    public function scopeForMonth($query, $month)
    {
        return $query->whereMonth('holiday_date', $month);
    }

    /**
     * Return distinct holiday dates (as 'Y-m-d' strings) that fall inside the given range
     * for the supplied org/company. Used by working-days computations so monthly working
     * days can be reduced by the number of holidays that fall on otherwise-working days.
     *
     * @param  string|\Carbon\Carbon  $start
     * @param  string|\Carbon\Carbon  $end
     * @param  int|null  $orgId
     * @param  int|null  $companyId
     * @return array<int, string>
     */
    public static function datesInRange($start, $end, ?int $orgId = null, ?int $companyId = null): array
    {
        $startStr = $start instanceof \Carbon\Carbon ? $start->format('Y-m-d') : (string) $start;
        $endStr = $end instanceof \Carbon\Carbon ? $end->format('Y-m-d') : (string) $end;

        // Bypass the auth-driven org/company global scope so this works in service/CLI contexts
        // (e.g., payroll jobs) where Auth::user() may be absent.
        $query = static::query()->withoutGlobalScope('org_company_scope');

        if ($orgId !== null) {
            $query->where('org_id', $orgId);
        }
        if ($companyId !== null) {
            $query->where('company_id', $companyId);
        }

        return $query->whereBetween('holiday_date', [$startStr, $endStr])
            ->pluck('holiday_date')
            ->map(fn ($d) => $d instanceof \Carbon\Carbon ? $d->format('Y-m-d') : (string) $d)
            ->unique()
            ->values()
            ->all();
    }
}
