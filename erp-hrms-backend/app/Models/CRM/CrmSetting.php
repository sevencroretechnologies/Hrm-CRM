<?php

namespace App\Models\CRM;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'org_id', 'campaign_naming_by', 'allow_lead_duplication_based_on_emails',
        'auto_creation_of_contact', 'close_opportunity_after_days',
        'default_valid_till', 'carry_forward_communication_and_comments',
    ];

    protected $casts = [
        'allow_lead_duplication_based_on_emails' => 'boolean',
        'auto_creation_of_contact' => 'boolean',
        'carry_forward_communication_and_comments' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Organization::class, 'org_id');
    }
}
