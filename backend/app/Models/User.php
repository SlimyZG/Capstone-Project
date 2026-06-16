<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department_id',
        'student_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ─── Role Helpers ─────────────────────────────────────────────────────────

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isDepartment(): bool { return $this->role === 'department'; }
    public function isStudent(): bool    { return $this->role === 'student'; }

    // ─── Relationships ─────────────────────────────────────────────────────────

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function upvotes()
    {
        return $this->hasMany(Upvote::class);
    }

    public function responses()
    {
        return $this->hasMany(ComplaintResponse::class);
    }
}
