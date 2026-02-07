<?php

namespace App\Modules\CRM\Models;

class OpportunityItem extends CrmBaseModel
{
    protected $table = 'crm_opportunity_items';

    protected $fillable = [
        'org_id',
        'opportunity_id',
        'product_name',
        'quantity',
        'unit_price',
        'discount',
        'total',
        'description',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id');
    }
}
