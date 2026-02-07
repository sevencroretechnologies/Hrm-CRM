<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'org_id', 'company_id', 'employee_id',
        'designation', 'department', 'joining_date', 'is_active',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function crmLeads(): HasMany
    {
        return $this->hasMany(\App\Models\CRM\Lead::class, 'staff_id');
    }
}
