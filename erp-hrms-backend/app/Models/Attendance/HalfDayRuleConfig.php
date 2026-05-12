<?php

namespace App\Models\Attendance;

use App\Traits\HasOrgAndCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HalfDayRuleConfig extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $fillable = [
        'arriving_late_minutes',
        'leaving_early_minutes',
        'is_active',
        'company_id',
        'org_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'arriving_late_minutes' => 'integer',
        'leaving_early_minutes' => 'integer',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
    }
}
