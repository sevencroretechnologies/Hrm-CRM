<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tables to add org_id and company_id columns to.
     */
    private array $tables = [
        'appointments',
        // 'campaigns',
        'candidate_sources',
        'crm_notes',
        'customer_contact_emails',
        'customer_contact_phones',
        'customer_contacts',
        'customer_groups',
        'customers',
        // 'industry_types',
        'leads',
        'opportunities',
        'opportunity_lost_reasons',
        'opportunity_products',
        // 'opportunity_stages',
        // 'opportunity_types',
        'payment_terms',
        'price_lists',
        'product_categories',
        'products',
        'prospect_leads',
        'prospect_opportunities',
        'prospects',
        // 'request_types',
        // 'resources',
        'role_audit_logs',
        'sales_stages',
        'sales_task_details',
        'sales_tasks',
        // 'sources',
        // 'statuses',
        // 'task_sources',
        // 'task_types',
         'tasks',
        // 'territories',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (!Schema::hasColumn($tableName, 'org_id')) {
                    $table->foreignId('org_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('organizations')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn($tableName, 'company_id')) {
                    $table->foreignId('company_id')
                        ->nullable()
                        ->after('org_id')
                        ->constrained('companies')
                        ->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                if (Schema::hasColumn($tableName, 'company_id')) {
                    $table->dropForeign(['company_id']);
                    $table->dropColumn('company_id');
                }

                if (Schema::hasColumn($tableName, 'org_id')) {
                    $table->dropForeign(['org_id']);
                    $table->dropColumn('org_id');
                }
            });
        }
    }
};
