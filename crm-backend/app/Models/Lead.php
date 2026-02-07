<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'salutation', 'first_name', 'middle_name', 'last_name', 'lead_name',
        'job_title', 'gender', 'lead_owner_id', 'status', 'type', 'request_type',
        'email_id', 'website', 'mobile_no', 'whatsapp_no', 'phone', 'phone_ext',
        'company_name', 'no_of_employees', 'annual_revenue', 'industry',
        'market_segment', 'territory', 'fax', 'city', 'state', 'country',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
        'qualification_status', 'qualified_by', 'qualified_on', 'company',
        'language', 'image', 'title', 'disabled', 'unsubscribed', 'blog_subscriber',
    ];

    protected $casts = [
        'annual_revenue' => 'decimal:2',
        'disabled' => 'boolean',
        'unsubscribed' => 'boolean',
        'blog_subscriber' => 'boolean',
        'qualified_on' => 'date',
    ];

    protected static function booted(): void
    {
        static::saving(function (Lead $lead) {
            $lead->setFullName();
            $lead->setLeadName();
            $lead->setTitle();
        });
    }

    public function setFullName(): void
    {
        if ($this->first_name) {
            $this->lead_name = trim(implode(' ', array_filter([
                $this->salutation, $this->first_name, $this->middle_name, $this->last_name
            ])));
        }
    }

    public function setLeadName(): void
    {
        if (!$this->lead_name) {
            if ($this->company_name) {
                $this->lead_name = $this->company_name;
            } elseif ($this->email_id) {
                $this->lead_name = explode('@', $this->email_id)[0];
            }
        }
    }

    public function setTitle(): void
    {
        $this->title = $this->company_name ?: $this->lead_name;
    }

    public function leadOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_owner_id');
    }

    public function qualifiedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'qualified_by');
    }

    public function prospects(): BelongsToMany
    {
        return $this->belongsToMany(Prospect::class, 'prospect_leads')
            ->withPivot(['lead_name', 'email', 'mobile_no', 'status'])
            ->withTimestamps();
    }

    public function notes(): MorphMany
    {
        return $this->morphMany(CrmNote::class, 'notable');
    }
}
