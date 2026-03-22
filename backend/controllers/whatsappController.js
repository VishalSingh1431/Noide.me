import whatsappService from '../services/whatsappService.js';
import whatsappWorker from '../workers/whatsappWorker.js';
import QRCode from 'qrcode';

// GET /api/admin/wa/qr - returns a QR code image as data URL
export const getWAQR = async (req, res) => {
    try {
        if (whatsappService.isConnected) {
            return res.json({ status: 'connected', qr: null });
        }
        if (!whatsappService.qrCode) {
            return res.json({ status: 'waiting_for_qr', qr: null });
        }
        const qrDataURL = await QRCode.toDataURL(whatsappService.qrCode);
        return res.json({ status: 'qr_ready', qr: qrDataURL });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/admin/wa/status - connection + worker status
export const getWAStatus = async (req, res) => {
    try {
        const service = whatsappService.getStatus();
        const worker = await whatsappWorker.getStatusFull();
        res.json({ service, worker });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/admin/wa/connect - initiate connection / generate QR
export const connectWA = async (req, res) => {
    try {
        await whatsappService.connect();
        res.json({ message: 'Connection initiated. Scan QR if prompted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/admin/wa/start - start automation worker
export const startWAWorker = async (req, res) => {
    try {
        const { category } = req.body;
        const result = await whatsappWorker.start(category);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/admin/wa/stop - stop automation worker
export const stopWAWorker = (req, res) => {
    try {
        const result = whatsappWorker.stop();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
