<?php

namespace App\Models\CRM;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractFulfilmentChecklist extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'requirement', 'fulfilled', 'notes'];

    protected $casts = [
        'fulfilled' => 'boolean',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
