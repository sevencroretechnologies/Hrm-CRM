<?php

namespace App\Models\CRM;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'org_id', 'staff_id', 'scheduled_time', 'status', 'customer_name',
        'customer_phone_number', 'customer_skype', 'customer_email',
        'customer_details', 'appointment_with', 'party',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Organization::class, 'org_id');
    }

    public function staffMember(): BelongsTo
    {
        return $this->belongsTo(\App\Models\StaffMember::class, 'staff_id');
    }
}
