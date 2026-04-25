<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Traits\HasOrgAndCompany;

class SalesStage extends Model
{
    use HasFactory, HasOrgAndCompany;

    protected $fillable = ['stage_name', 'description', 'org_id', 'company_id'];

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }
}
