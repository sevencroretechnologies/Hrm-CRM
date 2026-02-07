<?php

namespace App\Modules\CRM\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

abstract class CrmBaseModel extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Model $model) {
            $user = Auth::user();
            if ($user) {
                if (!is_null($user->org_id)) {
                    $model->org_id = $user->org_id;
                }
                $model->created_by = $user->id;
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(\App\Models\Organization::class, 'org_id');
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function scopeForOrganization($query, $orgId)
    {
        return $query->where($this->getTable() . '.org_id', $orgId);
    }

    public function scopeForCurrentOrganization($query)
    {
        $user = Auth::user();
        if ($user && $user->org_id) {
            return $query->where($this->getTable() . '.org_id', $user->org_id);
        }
        return $query;
    }
}
