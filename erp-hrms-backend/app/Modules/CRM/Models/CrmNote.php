<?php

namespace App\Modules\CRM\Models;

class CrmNote extends CrmBaseModel
{
    protected $table = 'crm_notes';

    protected $fillable = [
        'org_id',
        'created_by',
        'notable_type',
        'notable_id',
        'title',
        'body',
    ];

    public function notable()
    {
        return $this->morphTo();
    }
}
