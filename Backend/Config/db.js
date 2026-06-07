import mongoose from 'mongoose';
import dns from 'dns';
import { promises as dnsPromises } from 'dns';

// Force IPv4 and use Google + Cloudflare DNS BEFORE any connection attempt
// This is required because ISP DNS (Reliance, Jio, etc.) often fails to resolve
// MongoDB Atlas SRV records (_mongodb._tcp.*.mongodb.net)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const ConnectDb = async () => {
    try {
        console.log("MongoDB URI configured:", Boolean(process.env.MONGODB_URI));

        // Pre-warm DNS: Resolve the Atlas SRV record using our configured DNS
        // This ensures the DNS cache is populated before mongoose attempts connection
        try {
            const srvHost = process.env.MONGODB_URI
                .replace('mongodb+srv://', '')
                .split('@')[1]
                ?.split('/')[0];
            if (srvHost) {
                await dnsPromises.resolveSrv(`_mongodb._tcp.${srvHost}`);
                console.log(`✅ DNS resolved for: ${srvHost}`);
            }
        } catch (dnsErr) {
            console.warn("DNS pre-warm warning (non-fatal):", dnsErr.message);
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // 10s timeout
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
        });

        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ Error in MongoDB: ${err.message}`);
        process.exit(1);
    }
};

export default ConnectDb;

