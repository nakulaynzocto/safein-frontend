import { io, Socket } from 'socket.io-client';

const BASE_SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL
    ? process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL.replace(/\/api$/, '')
    : 'http://localhost:4011';

const SUPPORT_URL = `${BASE_SUPER_ADMIN_URL}/support`;

export class SupportSocketService {
    private socket: Socket | null = null;
    private static instance: SupportSocketService;

    // Singleton Pattern
    public static getInstance(): SupportSocketService {
        if (!SupportSocketService.instance) {
            SupportSocketService.instance = new SupportSocketService();
        }
        return SupportSocketService.instance;
    }

    public connect(token?: string, googleToken?: string): Socket {
        if (this.socket && this.socket.connected) return this.socket;

        this.socket = io(SUPPORT_URL, {
            auth: {
                token,       // For Employees
                googleToken  // For Public Users
            },
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Connected to Support Chat System');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Support Chat Connection Error:', err.message);
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
