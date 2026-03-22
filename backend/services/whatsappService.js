import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const AUTH_DIR = join(__dirname, '..', '.wa_auth');

class WhatsAppService extends EventEmitter {
    constructor() {
        super();
        this.socket = null;
        this.isConnected = false;
        this.qrCode = null;
        this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'connected' | 'qr_ready'
    }

    async connect() {
        if (this.socket && this.isConnected) return;

        // Ensure auth directory exists
        if (!fs.existsSync(AUTH_DIR)) {
            fs.mkdirSync(AUTH_DIR, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version } = await fetchLatestBaileysVersion();

        const logger = pino({ level: 'silent' }); // Suppress noisy logs

        this.status = 'connecting';
        this.emit('status', this.status);

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            logger,
            printQRInTerminal: false,
            browser: ['Noida.me', 'Chrome', '120.0.0'],
            getMessage: async () => undefined,
        });

        this.socket = sock;

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.qrCode = qr;
                this.status = 'qr_ready';
                this.emit('qr', qr);
                this.emit('status', this.status);
            }

            if (connection === 'open') {
                this.isConnected = true;
                this.qrCode = null;
                this.status = 'connected';
                this.emit('connected');
                this.emit('status', this.status);
                console.log('✅ WhatsApp connected');
            }

            if (connection === 'close') {
                this.isConnected = false;
                this.status = 'disconnected';
                this.emit('status', this.status);
                const reason = lastDisconnect?.error?.output?.statusCode;
                console.log('WhatsApp disconnected, reason:', reason);

                // Reconnect unless logged out
                if (reason !== DisconnectReason.loggedOut) {
                    console.log('Reconnecting in 5s...');
                    setTimeout(() => this.connect(), 5000);
                } else {
                    console.log('WhatsApp logged out. Clear .wa_auth to re-connect.');
                }
            }
        });
    }

    async sendMessage(phone, text) {
        if (!this.isConnected || !this.socket) {
            throw new Error('WhatsApp is not connected');
        }

        // Ensure proper format: 91XXXXXXXXXX@s.whatsapp.net
        const digits = phone.replace(/\D/g, '');
        const number = digits.length === 10 ? '91' + digits : digits;
        const jid = `${number}@s.whatsapp.net`;

        await this.socket.sendMessage(jid, { text });
    }

    disconnect() {
        if (this.socket) {
            this.socket.end(undefined);
            this.socket = null;
        }
        this.isConnected = false;
        this.status = 'disconnected';
        this.qrCode = null;
        this.emit('status', this.status);
    }

    getStatus() {
        return {
            status: this.status,
            isConnected: this.isConnected,
            hasQR: !!this.qrCode,
        };
    }
}

// Singleton instance
const whatsappService = new WhatsAppService();
export default whatsappService;
