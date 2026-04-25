<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\HasOrgAndCompany;

class OpportunityProduct extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $table = 'opportunity_products';

    protected $fillable = [
        'opportunity_id',
        'product_id',
        'quantity',
        'rate',
        'amount',
        'org_id',
        'company_id',
    ];

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
