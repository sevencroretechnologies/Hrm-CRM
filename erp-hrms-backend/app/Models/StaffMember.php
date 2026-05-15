<?php

namespace App\Models;

use App\Traits\HasOrgAndCompany;
use App\Traits\StandardDateSerialization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffMember extends Model
{
    use HasFactory, HasOrgAndCompany, SoftDeletes, StandardDateSerialization;

    protected $fillable = [
        'user_id',
        'full_name',
        'profile_image',
        'personal_email',
        'mobile_number',
        'birth_date',
        'gender',
        'home_address',
        'nationality',
        'passport_number',
        'country_code',
        'region',
        'city_name',
        'postal_code',
        'staff_code',
        'biometric_id',
        'office_location_id',
        'division_id',
        'job_title_id',
        'hire_date',
        'bank_account_name',
        'bank_account_number',
        'bank_name',
        'bank_branch',
        'compensation_type',
        'base_salary',
        'employment_status',
        'employment_type',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
        'tenant_id',
        'author_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'base_salary' => 'decimal:2',
    ];

    /**
     * Generate unique staff code.
     */
    public static function generateStaffCode(): string
    {
        $prefix = 'STF';

        // Must use withoutGlobalScopes() so we check ALL records across all orgs/tenants.
        // The unique constraint on staff_code is table-wide, so we need a globally unique code.
        $last = static::withoutGlobalScopes()
            ->withTrashed()
            ->where('staff_code', 'like', $prefix . '%')
            ->orderByRaw('CAST(SUBSTRING(staff_code, ' . (strlen($prefix) + 1) . ') AS UNSIGNED) DESC')
            ->value('staff_code');

        $nextNumber = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        // Safety loop: keep incrementing until we find a completely unused code
        do {
            $code = $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
            $exists = static::withoutGlobalScopes()
                ->withTrashed()
                ->where('staff_code', $code)
                ->exists();
            if ($exists) {
                $nextNumber++;
            }
        } while ($exists);

        return $code;
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->staff_code)) {
                $model->staff_code = static::generateStaffCode();
            }
        });
    }

    // Relationships

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function officeLocation()
    {
        return $this->belongsTo(OfficeLocation::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function jobTitle()
    {
        return $this->belongsTo(JobTitle::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function files()
    {
        return $this->hasMany(StaffFile::class);
    }

    public function recognitionRecords()
    {
        return $this->hasMany(RecognitionRecord::class);
    }

    public function roleUpgrades()
    {
        return $this->hasMany(RoleUpgrade::class);
    }

    public function locationTransfers()
    {
        return $this->hasMany(LocationTransfer::class);
    }

    public function disciplineNotes()
    {
        return $this->hasMany(DisciplineNote::class);
    }

    public function voluntaryExits()
    {
        return $this->hasMany(VoluntaryExit::class);
    }

    public function offboardings()
    {
        return $this->hasMany(Offboarding::class);
    }

    public function businessTrips()
    {
        return $this->hasMany(BusinessTrip::class);
    }

    public function salesTasks()
    {
        return $this->hasMany(SalesTask::class, 'sales_assign_id');
    }

    public function grievancesFiled()
    {
        return $this->hasMany(Grievance::class, 'filed_by_staff_id');
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('employment_status', 'active');
    }

    public function scopeForLocation($query, $locationId)
    {
        return $query->where('office_location_id', $locationId);
    }

    public function scopeForDivision($query, $divisionId)
    {
        return $query->where('division_id', $divisionId);
    }
}
