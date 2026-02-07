<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Opportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'opportunity_from', 'party_id', 'customer_name', 'status',
        'opportunity_type', 'opportunity_owner_id', 'sales_stage_id',
        'expected_closing', 'probability', 'no_of_employees', 'annual_revenue',
        'customer_group', 'industry', 'market_segment', 'website',
        'city', 'state', 'country', 'territory', 'currency', 'conversion_rate',
        'opportunity_amount', 'base_opportunity_amount',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
        'company', 'transaction_date', 'language', 'title',
        'contact_person', 'job_title', 'contact_email', 'contact_mobile',
        'whatsapp', 'phone', 'phone_ext', 'order_lost_reason',
        'total', 'base_total',
    ];

    protected $casts = [
        'annual_revenue' => 'decimal:2',
        'opportunity_amount' => 'decimal:2',
        'base_opportunity_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'base_total' => 'decimal:2',
        'probability' => 'decimal:2',
        'conversion_rate' => 'decimal:4',
        'expected_closing' => 'date',
        'transaction_date' => 'date',
    ];

    protected static function booted(): void
    {
        static::saving(function (Opportunity $opp) {
            $opp->calculateTotals();
        });
    }

    public function calculateTotals(): void
    {
        if ($this->exists) {
            $total = $this->items()->sum('amount');
            $baseTotal = $this->items()->sum('base_amount');
            $this->total = $total;
            $this->base_total = $baseTotal;
        }
    }

    public function opportunityOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opportunity_owner_id');
    }

    public function salesStage(): BelongsTo
    {
        return $this->belongsTo(SalesStage::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OpportunityItem::class);
    }

    public function lostReasons(): BelongsToMany
    {
        return $this->belongsToMany(OpportunityLostReason::class, 'opportunity_lost_reason_details');
    }

    public function competitors(): BelongsToMany
    {
        return $this->belongsToMany(Competitor::class, 'competitor_details');
    }

    public function notes(): MorphMany
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
