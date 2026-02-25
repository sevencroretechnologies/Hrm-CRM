<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Competitor extends Model
{
    use HasFactory;

    protected $fillable = ['competitor_name', 'website'];

    public function opportunities(): BelongsToMany
    {
        return $this->belongsToMany(Opportunity::class, 'competitor_details');
    }
}
