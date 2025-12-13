<?php

namespace App\Services;

use App\Models\UserNotification;
use App\Models\User;

class NotificationService
{
    /**
     * Notify church admins about a new request
     */
    public static function notifyChurchAdmins($type, $title, $message, $requestId = null)
    {
        $churchAdmins = User::where('role', 'church_admin')->get();
        
        foreach ($churchAdmins as $admin) {
            UserNotification::create([
                'user_id' => $admin->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'request_id' => $requestId,
                'read' => false,
            ]);
        }
    }

    /**
     * Notify accountants about payment-related activities
     */
    public static function notifyAccountants($type, $title, $message, $requestId = null)
    {
        $accountants = User::where('role', 'accountant')->get();
        
        foreach ($accountants as $accountant) {
            UserNotification::create([
                'user_id' => $accountant->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'request_id' => $requestId,
                'read' => false,
            ]);
        }
    }

    /**
     * Notify a specific user
     */
    public static function notifyUser($userId, $type, $title, $message, $requestId = null)
    {
        UserNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'request_id' => $requestId,
            'read' => false,
        ]);
    }

    /**
     * Notify user about request status change
     */
    public static function notifyUserAboutRequestStatus($userId, $requestType, $requestId, $status)
    {
        $statusMessages = [
            'pending' => 'Your request has been received and is pending review.',
            'processing' => 'Your request is now being processed.',
            'approved' => 'Your request has been approved.',
            'completed' => 'Your request has been completed.',
            'rejected' => 'Your request has been rejected.',
        ];

        $message = $statusMessages[$status] ?? 'Your request status has been updated.';

        self::notifyUser(
            $userId,
            'request_status',
            ucfirst($requestType) . ' Request ' . ucfirst($status),
            $message,
            $requestId
        );
    }
}
