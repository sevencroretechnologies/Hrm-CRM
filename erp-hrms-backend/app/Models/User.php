<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Traits\HasOrgAndCompany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasOrgAndCompany, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'org_id',
        'company_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Computed attributes appended to JSON output.
     */
    protected $appends = [
        'user_type',
        'user_type_name',
        'user_type_label',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the staff member profile associated with this user.
     */
    public function staffMember()
    {
        return $this->hasOne(StaffMember::class);
    }

    /**
     * Get the organization associated with this user.
     */
    public function organization()
    {
        return $this->belongsTo(Organization::class, 'org_id');
    }

    /**
     * Get the company associated with this user.
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * Numeric user type code based on role hierarchy.
     * 1=admin, 2=org, 3=company, 4=hr, 5=user.
     * Defaults to 5 (USER) when no role is assigned.
     */
    protected function userType(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->primaryRoleEnum()?->hierarchy()
                ?? UserRole::USER->hierarchy()
        );
    }

    /**
     * Slug for the primary role: "admin", "org", "company", "hr", "user".
     */
    protected function userTypeName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->primaryRoleEnum()?->value
                ?? UserRole::USER->value
        );
    }

    /**
     * Human-readable label for the primary role.
     */
    protected function userTypeLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->primaryRoleEnum()?->label()
                ?? UserRole::USER->label()
        );
    }

    /**
     * Resolve the UserRole enum case for this user's primary role,
     * or null if the assigned role isn't a known system role.
     */
    protected function primaryRoleEnum(): ?UserRole
    {
        $name = $this->roles->sortBy('hierarchy_level')->first()?->name;

        return $name ? UserRole::tryFrom($name) : null;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN->value);
    }

    public function isOrg(): bool
    {
        return $this->hasRole(UserRole::ORG->value);
    }

    public function isCompany(): bool
    {
        return $this->hasRole(UserRole::COMPANY->value);
    }

    public function isHr(): bool
    {
        return $this->hasRole(UserRole::HR->value);
    }

    public function isStaff(): bool
    {
        return $this->hasRole(UserRole::USER->value);
    }

    /**
     * Find users of a given role type.
     * Usage: User::ofType(UserRole::HR)->paginate();
     */
    public function scopeOfType($query, string|UserRole $role)
    {
        $name = $role instanceof UserRole ? $role->value : $role;

        return $query->whereHas('roles', fn ($q) => $q->where('name', $name));
    }
}
