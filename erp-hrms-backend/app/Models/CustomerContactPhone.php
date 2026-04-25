<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\HasOrgAndCompany;

class CustomerContactPhone extends Model
{
    use HasFactory, HasOrgAndCompany;

    protected $table = 'customer_contact_phones';

    protected $fillable = [
        'contact_id',
        'phone_no',
        'is_primary',
        'org_id',
        'company_id',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }
}
