<?php

namespace App\Modules\CRM\Models;

class Appointment extends CrmBaseModel
{
    protected $table = 'crm_appointments';

    protected $fillable = [
        'org_id',
        'created_by',
        'assigned_to',
        'lead_id',
        'prospect_id',
        'opportunity_id',
        'title',
        'description',
        'location',
        'start_time',
        'end_time',
        'status',
        'outcome',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
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

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class, 'opportunity_id');
    }
}
