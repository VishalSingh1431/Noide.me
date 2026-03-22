import pool from '../config/database.js';
import whatsappService from '../services/whatsappService.js';

// Config for ban prevention
const DAILY_LIMIT = 30; // max messages per day
const MIN_DELAY_MS = 60000; // 60 seconds
const MAX_DELAY_MS = 150000; // 150 seconds

// Numbers to never message (add 10-digit or 12-digit cleaned numbers here)
const BLOCKLIST = new Set(['9794894562', '919794894562']);

const buildMessage = (business) => {
    const url = business.subdomain_url || `https://noida.me`;
    return `Hello,

We are from the Noida.me team. We help local businesses build a simple online presence so customers can easily find them on the internet.

As part of this initiative, we have created a simple website for your business. You can view it here:

${url}

Currently, we are offering this service free for the first month so you can try it and share it with your customers.

If you would like to update any details or make changes to the website, feel free to reply to this message and our team will assist you.

Thank you.
— Team Noida.me
https://noida.me


नमस्ते,

हम Noida.me टीम से हैं। हम local businesses को online लाने में मदद कर रहे हैं ताकि लोग उन्हें इंटरनेट पर आसानी से ढूंढ सकें।

इसी पहल के तहत हमने आपके business के लिए एक simple website बनाई है। आप इसे यहाँ देख सकते हैं:

${url}

फिलहाल हम पहले महीने के लिए यह सेवा मुफ्त दे रहे हैं ताकि आप इसे आज़मा सकें और अपने ग्राहकों के साथ शेयर कर सकें।

यदि आप अपनी website में कोई जानकारी बदलना चाहते हैं, तो बेझिझक इस मैसेज का जवाब दें। हमारी टीम आपकी पूरी मदद करेगी।

धन्यवाद।
— टीम Noida.me
https://noida.me`;
};

const randomDelay = () =>
    new Promise((r) =>
        setTimeout(
            r,
            Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS) + MIN_DELAY_MS)
        )
    );

const getTodaySentCount = async () => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM businesses
     WHERE whatsapp_notified = TRUE
       AND whatsapp_notified_at >= CURRENT_DATE`
    );
    return parseInt(result.rows[0].count, 10);
};

class WhatsAppWorker {
    constructor() {
        this.isRunning = false;
        this.abortController = null;
        this.processedToday = 0;
        this.log = [];
    }

    async start(category = null) {
        if (this.isRunning) return { success: false, message: 'Already running' };
        if (!whatsappService.isConnected) {
            return { success: false, message: 'WhatsApp not connected. Scan QR first.' };
        }

        this.isRunning = true;
        this.category = category; // Store the selected category
        this.abortController = new AbortController();
        const { signal } = this.abortController;

        this._addLog(`▶️ Automation started${category ? ` (Category: ${category})` : ''}`);
        this._run(signal, category).catch((e) => {
            this._addLog('❌ Worker error: ' + e.message);
            this.isRunning = false;
        });

        return { success: true, message: `Automation started${category ? ` for ${category}` : ''}` };
    }

    stop() {
        if (!this.isRunning) return { success: false, message: 'Not running' };
        this.abortController?.abort();
        this.isRunning = false;
        this.category = null;
        this._addLog('⏹️ Automation stopped by admin');
        return { success: true, message: 'Stopped' };
    }

    async _run(signal, category) {
        while (!signal.aborted) {
            // Refresh how many we've sent today
            const sentToday = await getTodaySentCount();
            if (sentToday >= DAILY_LIMIT) {
                this._addLog(`⚠️ Daily limit (${DAILY_LIMIT}) reached. Stopping for today.`);
                this.isRunning = false;
                return;
            }

            // Get next unsent business
            let query = `
                SELECT id, business_name, whatsapp, mobile, subdomain_url, category
                FROM businesses
                WHERE whatsapp_notified = FALSE
                  AND status = 'approved'
                  AND (whatsapp IS NOT NULL OR mobile IS NOT NULL)
            `;
            const params = [];

            if (category && category !== 'All') {
                query += ` AND category = $1`;
                params.push(category);
            }

            query += ` ORDER BY id ASC LIMIT 1`;

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                this._addLog(`✅ No more businesses to notify${category ? ` in category ${category}` : ''}. Queue empty.`);
                this.isRunning = false;
                return;
            }

            const business = result.rows[0];
            const phone = business.whatsapp || business.mobile;
            const cleanedPhone = (phone || '').replace(/\D/g, '');

            // Skip blocklisted numbers
            if (BLOCKLIST.has(cleanedPhone) || BLOCKLIST.has('91' + cleanedPhone)) {
                this._addLog(`⛔ Skipping blocked number: ${business.business_name} (${phone})`);
                // Mark notified=TRUE so it's never queued again, but NO timestamp
                // so it does NOT count toward the daily 30-message limit
                await pool.query(
                    `UPDATE businesses SET whatsapp_notified = TRUE, whatsapp_notified_at = NULL WHERE id = $1`,
                    [business.id]
                );
                continue;
            }

            try {
                this._addLog(`📤 Sending to ${business.business_name} (${phone}) [${business.category}]...`);
                await whatsappService.sendMessage(phone, buildMessage(business));

                // Mark as sent in DB
                await pool.query(
                    `UPDATE businesses SET whatsapp_notified = TRUE, whatsapp_notified_at = NOW() WHERE id = $1`,
                    [business.id]
                );

                this._addLog(`✅ Sent to ${business.business_name}`);
            } catch (err) {
                this._addLog(`❌ Failed for ${business.business_name}: ${err.message}`);
                // Mark as notified so we skip it next time
                await pool.query(
                    `UPDATE businesses SET whatsapp_notified = TRUE, whatsapp_notified_at = NOW() WHERE id = $1`,
                    [business.id]
                );
            }

            if (signal.aborted) break;

            // Wait random delay before next message
            this._addLog(`⏳ Waiting before next message...`);
            await randomDelay();
        }

        this.isRunning = false;
    }

    async getStatusFull() {
        // Get all-time total sent count from DB
        let totalSent = 0;
        let sentToday = 0;
        try {
            const r1 = await pool.query(`SELECT COUNT(*) FROM businesses WHERE whatsapp_notified = TRUE`);
            totalSent = parseInt(r1.rows[0].count, 10);
            const r2 = await pool.query(`SELECT COUNT(*) FROM businesses WHERE whatsapp_notified = TRUE AND whatsapp_notified_at >= CURRENT_DATE`);
            sentToday = parseInt(r2.rows[0].count, 10);
        } catch { }
        return {
            isRunning: this.isRunning,
            log: this.log.slice(-20),
            totalSent,
            sentToday,
            dailyLimit: DAILY_LIMIT,
        };
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            log: this.log.slice(-20),
        };
    }

    _addLog(msg) {
        const entry = `[${new Date().toLocaleTimeString('en-IN')}] ${msg}`;
        this.log.push(entry);
        console.log('WA Worker:', entry);
        // Keep log bounded
        if (this.log.length > 100) this.log = this.log.slice(-100);
    }
}

const whatsappWorker = new WhatsAppWorker();
export default whatsappWorker;
