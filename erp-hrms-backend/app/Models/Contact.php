<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\HasOrgAndCompany;

class Contact extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $table = 'customer_contacts';

    protected $fillable = [
        'customer_id',
        'salutation',
        'first_name',
        'middle_name',
        'last_name',
        'designation',
        'gender',
        'company_name',
        'address',
        'status',
        'org_id',
        'company_id',
    ];

    protected $appends = ['full_name'];

    protected $with = ['phones', 'emails', 'bankDetails'];

    public function getFullNameAttribute(): string
    {
        return trim(
            ($this->salutation ? $this->salutation . ' ' : '') .
            $this->first_name .
            ($this->middle_name ? ' ' . $this->middle_name : '') .
            ($this->last_name ? ' ' . $this->last_name : '')
        );
    }

    public function customer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function phones(): HasMany
    {
        return $this->hasMany(CustomerContactPhone::class, 'contact_id');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CustomerContactEmail::class, 'contact_id');
    }
    public function bankDetails(): HasMany
    {
        return $this->hasMany(CustomerBankDetail::class, 'customer_contact_id');
    }
}
