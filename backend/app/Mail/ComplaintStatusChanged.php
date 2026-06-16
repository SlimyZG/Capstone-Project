<?php

namespace App\Mail;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplaintStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Complaint $complaint,
        public string $oldStatus
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[UniComplaints] Your complaint status has been updated',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.complaint-status-changed',
        );
    }
}
