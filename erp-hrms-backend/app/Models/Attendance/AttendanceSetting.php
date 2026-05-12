<?php

namespace App\Models\Attendance;

use App\Traits\HasOrgAndCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttendanceSetting extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $fillable = [
        'org_id',
        'company_id',
        'default_clock_in_time',
        'default_clock_out_time',
        'grace_minutes',
    ];

    protected $casts = [
        'grace_minutes' => 'integer',
    ];
}
