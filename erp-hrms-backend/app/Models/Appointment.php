<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\HasOrgAndCompany;

class Appointment extends Model
{
    use HasFactory, HasOrgAndCompany;

    protected $fillable = [
        'scheduled_time', 'status','appointment_with', 'party', 'org_id', 'company_id',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
    ];
}
