<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\HasOrgAndCompany;

class PaymentTerm extends Model
{
    use HasFactory, SoftDeletes, HasOrgAndCompany;

    protected $fillable = ['name', 'days', 'org_id', 'company_id'];
}
