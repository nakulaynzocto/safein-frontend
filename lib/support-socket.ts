import { io, Socket } from 'socket.io-client';

const BASE_SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL
    ? process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL.replace(/\/api$/, '')
    : 'http://localhost:4011';

const SUPPORT_URL = `${BASE_SUPER_ADMIN_URL}/support`;

export class SupportSocketService {
    private static instance: SupportSocketService;
    private socket: Socket | null = null;
    private isConnecting: boolean = false;
    private lastToken: string | undefined;
    private lastGoogleToken: string | undefined;

    // Singleton Pattern
    public static getInstance(): SupportSocketService {
        if (!SupportSocketService.instance) {
            SupportSocketService.instance = new SupportSocketService();
        }
        return SupportSocketService.instance;
    }

    public connect(token?: string, googleToken?: string): Socket {
        // If we already have a socket and tokens haven't changed, return existing
        if (this.socket && (this.socket.connected || this.isConnecting)) {
            if (this.lastToken === token && this.lastGoogleToken === googleToken) {
                return this.socket;
            }
            // Tokens changed, disconnect existing socket
            this.socket.disconnect();
        }

        this.lastToken = token;
        this.lastGoogleToken = googleToken;
        this.isConnecting = true;

        this.socket = io(SUPPORT_URL, {
            auth: {
                token,       // For Employees
                googleToken  // For Public Users
            },
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            this.isConnecting = false;
        });

        this.socket.on('connect_error', (err) => {
            this.isConnecting = false;
            if (err.message && (err.message.includes('Authentication') || err.message.includes('Auth'))) {
                console.warn('Support Chat Authentication failed (falling back to REST):', err.message);
            } else if (err.message && (err.message.includes('xhr poll error') || err.message.includes('websocket error') || err.message.includes('failed'))) {
                console.warn('Support Chat: Real-time server unreachable. Falling back to REST API for messages.');
            } else {
                console.error('Support Chat Connection Error:', err.message);
            }
        });

        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }
}

export const supportSocketService = SupportSocketService.getInstance();
