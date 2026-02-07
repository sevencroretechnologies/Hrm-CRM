<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'email', 'phone', 'address', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'org_id');
    }

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class, 'org_id');
    }

    public function staffMembers(): HasMany
    {
        return $this->hasMany(StaffMember::class, 'org_id');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(\App\Models\CRM\Lead::class, 'org_id');
    }
}
