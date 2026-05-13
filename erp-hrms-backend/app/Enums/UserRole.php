<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case ORG = 'org';
    case COMPANY = 'company';
    case HR = 'hr';
    case USER = 'user';

    /**
     * Hierarchy level — lower number means higher privilege.
     * Matches the seeded hierarchy in AccessSeeder.
     */
    public function hierarchy(): int
    {
        return match ($this) {
            self::ADMIN => 1,
            self::ORG => 2,
            self::COMPANY => 3,
            self::HR => 4,
            self::USER => 5,
        };
    }

    /**
     * Human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Admin',
            self::ORG => 'Organization',
            self::COMPANY => 'Company',
            self::HR => 'HR',
            self::USER => 'User',
        };
    }

    /**
     * Get all enum values as an array.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get enum options for dropdowns.
     */
    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
