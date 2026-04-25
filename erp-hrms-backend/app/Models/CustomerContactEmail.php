<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\HasOrgAndCompany;

class CustomerContactEmail extends Model
{
    use HasFactory, HasOrgAndCompany;

    protected $table = 'customer_contact_emails';

    protected $fillable = [
        'contact_id',
        'email',
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
