<?php

namespace App\Modules\CRM\Models;

class CrmSetting extends CrmBaseModel
{
    protected $table = 'crm_settings';

    protected $fillable = [
        'org_id',
        'created_by',
        'key',
        'value',
    ];
}
