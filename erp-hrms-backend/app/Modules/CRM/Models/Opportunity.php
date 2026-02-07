<?php

namespace App\Modules\CRM\Models;

class Opportunity extends CrmBaseModel
{
    protected $table = 'crm_opportunities';

    protected $fillable = [
        'org_id',
        'created_by',
        'assigned_to',
        'lead_id',
        'prospect_id',
        'sales_stage_id',
        'campaign_id',
        'name',
        'amount',
        'expected_close_date',
        'probability',
        'status',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'probability' => 'decimal:2',
        'expected_close_date' => 'date',
    ];

    public function assignee()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function prospect()
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    public function salesStage()
    {
        return $this->belongsTo(SalesStage::class, 'sales_stage_id');
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function items()
    {
        return $this->hasMany(OpportunityItem::class, 'opportunity_id');
    }

    public function contracts()
    {
        return $this->hasMany(CrmContract::class, 'opportunity_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'opportunity_id');
    }

    public function notes()
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
