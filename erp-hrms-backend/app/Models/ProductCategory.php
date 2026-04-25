<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Traits\HasOrgAndCompany;

class ProductCategory extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $fillable = ['name', 'description', 'org_id', 'company_id'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
