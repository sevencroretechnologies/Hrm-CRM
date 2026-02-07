<?php

namespace App\Modules\CRM\Models;

class Campaign extends CrmBaseModel
{
    protected $table = 'crm_campaigns';

    protected $fillable = [
        'org_id',
        'created_by',
        'name',
        'type',
        'status',
        'start_date',
        'end_date',
        'budget',
        'actual_cost',
        'expected_revenue',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'campaign_id');
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'campaign_id');
    }
}
