<?php

namespace App\Modules\CRM\Models;

class CrmContract extends CrmBaseModel
{
    protected $table = 'crm_contracts';

    protected $fillable = [
        'org_id',
        'created_by',
        'opportunity_id',
        'prospect_id',
        'reference_number',
        'title',
        'value',
        'start_date',
        'end_date',
        'status',
        'terms',
        'description',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id');
    }

    public function prospect()
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }
}
