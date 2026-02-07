<?php

namespace App\Modules\CRM\Models;

class Prospect extends CrmBaseModel
{
    protected $table = 'crm_prospects';

    protected $fillable = [
        'org_id',
        'created_by',
        'assigned_to',
        'company_name',
        'contact_name',
        'email',
        'phone',
        'website',
        'industry',
        'status',
        'address',
        'notes',
    ];

    public function assignee()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    public function leads()
    {
        return $this->belongsToMany(Lead::class, 'crm_prospect_leads', 'prospect_id', 'lead_id');
    }

    public function opportunities()
    {
        return $this->hasMany(Opportunity::class, 'prospect_id');
    }

    public function contracts()
    {
        return $this->hasMany(CrmContract::class, 'prospect_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'prospect_id');
    }

    public function crmNotes()
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
