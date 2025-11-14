/**
 * Telegram notification utility for sending meeting join notifications
 */

interface TelegramNotificationParams {
    userName: string;
    roomName?: string;
    timestamp?: string;
}

/**
 * Sends a notification to Telegram when a user joins a meeting
 * 
 * @param {TelegramNotificationParams} params - The notification parameters
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export const sendTelegramNotification = async ({
    userName,
    roomName,
    timestamp = new Date().toLocaleString()
}: TelegramNotificationParams): Promise<boolean> => {
    const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

    // Validate credentials
    if (!botToken || !chatId) {
        console.error('Telegram credentials are missing. Please check your .env file.');
        return false;
    }

    // Construct the message
    const message = `
🎥 *New Meeting Participant*

👤 *User:* ${userName}
🏢 *Room:* ${roomName || 'Unknown'}
🕐 *Time:* ${timestamp}

✅ User has joined the meeting successfully.
    `.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Telegram API error:', errorData);
            return false;
        }

        const data = await response.json();
        console.log('Telegram notification sent successfully:', data);
        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
};

/**
 * Sends a silent notification (without sound) to Telegram
 * 
 * @param {TelegramNotificationParams} params - The notification parameters
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export const sendSilentTelegramNotification = async (
    params: TelegramNotificationParams
): Promise<boolean> => {
    const botToken = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.REACT_APP_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.error('Telegram credentials are missing. Please check your .env file.');
        return false;
    }

    const message = `
🎥 Meeting Join: ${params.userName}
Room: ${params.roomName || 'Unknown'}
Time: ${params.timestamp || new Date().toLocaleString()}
    `.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                disable_notification: true, // Silent notification
            }),
        });

        if (!response.ok) {
            console.error('Failed to send silent Telegram notification');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending silent Telegram notification:', error);
        return false;
    }
};