<?php

namespace App\Modules\CRM\Models;

class SalesStage extends CrmBaseModel
{
    protected $table = 'crm_sales_stages';

    protected $fillable = [
        'org_id',
        'created_by',
        'name',
        'position',
        'probability',
        'is_active',
    ];

    protected $casts = [
        'probability' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'sales_stage_id');
    }
}
