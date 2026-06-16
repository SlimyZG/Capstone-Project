<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
        .header { background: linear-gradient(135deg, #6366f1, #7c3aed); padding: 32px; text-align: center; }
        .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 700; }
        .body { padding: 32px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-pending { background: #fee2e2; color: #b91c1c; }
        .badge-investigating { background: #fef3c7; color: #b45309; }
        .badge-resolved { background: #d1fae5; color: #065f46; }
        .badge-closed { background: #f1f5f9; color: #475569; }
        .btn { display: inline-block; background: #6366f1; color: #fff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
        .footer { padding: 16px 32px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🎓 UniComplaints</h1>
    </div>
    <div class="body">
        <h2 style="color:#1e293b;margin-top:0">Your complaint status has been updated</h2>
        <p style="color:#475569">Hi there,</p>
        <p style="color:#475569">Your complaint <strong>"{{ $complaint->title }}"</strong> has been updated:</p>

        <p style="color:#475569">
            <span class="badge badge-{{ $oldStatus }}">{{ ucfirst($oldStatus) }}</span>
            &nbsp;→&nbsp;
            <span class="badge badge-{{ $complaint->status }}">{{ ucfirst($complaint->status) }}</span>
        </p>

        <p style="color:#475569">Department: <strong>{{ $complaint->department->name }}</strong></p>

        <a href="{{ route('student.complaints.show', $complaint) }}" class="btn">View Complaint →</a>
    </div>
    <div class="footer">UniComplaints · University Student Complaints Portal</div>
</div>
</body>
</html>
