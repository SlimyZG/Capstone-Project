<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'department_id',
        'title',
        'body',
        'status',
        'is_anonymous',
        'is_private',
        'attachment_path',
        'upvotes_count',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_private' => 'boolean',
    ];

    // ─── Status Helpers ────────────────────────────────────────────────────────

    public static array $statuses = ['pending', 'investigating', 'resolved', 'closed'];

    public function statusBadgeClass(): string
    {
        return match($this->status) {
            'pending'      => 'badge-pending',
            'investigating'=> 'badge-investigating',
            'resolved'     => 'badge-resolved',
            'closed'       => 'badge-closed',
            default        => 'badge-pending',
        };
    }

    public function statusLabel(): string
    {
        return ucfirst($this->status);
    }

    // ─── Relationships ─────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class)->withDefault(['name' => 'Anonymous']);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function responses()
    {
        return $this->hasMany(ComplaintResponse::class)->orderBy('created_at');
    }

    public function upvotes()
    {
        return $this->hasMany(Upvote::class);
    }

    // ─── Scopes ────────────────────────────────────────────────────────────────

    public function scopeForDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    public function displayAuthor(): string
    {
        if ($this->is_anonymous) {
            return 'Anonymous';
        }
        return $this->user->name ?? 'Anonymous';
    }

    public function hasBeenUpvotedBy(User $user): bool
    {
        return $this->upvotes()->where('user_id', $user->id)->exists();
    }

    public function toArray()
    {
        $array = parent::toArray();
        if ($this->is_anonymous) {
            $user = auth()->user();
            $canSeeIdentity = $user && $user->id === $this->user_id;
            if (!$canSeeIdentity) {
                unset($array['user']);
                $array['user'] = [
                    'name' => 'Anonymous',
                ];
                $array['user_id'] = null;
            }
        }
        return $array;
    }
}
