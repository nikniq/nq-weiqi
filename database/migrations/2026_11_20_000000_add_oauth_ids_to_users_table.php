<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id', 64)->nullable()->unique()->after('password');
            $table->string('nikniq_id', 64)->nullable()->unique()->after('google_id');
            $table->string('avatar', 500)->nullable()->after('nikniq_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropUnique(['nikniq_id']);
            $table->dropColumn(['google_id', 'nikniq_id', 'avatar']);
        });
    }
};
