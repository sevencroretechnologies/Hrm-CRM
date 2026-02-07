<?php

namespace App\Modules\CRM\Models;

class Lead extends CrmBaseModel
{
    protected $table = 'crm_leads';

    protected $fillable = [
        'org_id',
        'created_by',
        'assigned_to',
        'campaign_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'company_name',
        'job_title',
        'source',
        'status',
        'address',
        'description',
    ];

    public function assignee()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function prospects()
    {
        return $this->belongsToMany(Prospect::class, 'crm_prospect_leads', 'lead_id', 'prospect_id');
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'lead_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'lead_id');
    }

    public function notes()
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
