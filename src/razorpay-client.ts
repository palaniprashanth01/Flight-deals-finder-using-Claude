import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export class RazorpayClient {
    private instance: any;

    constructor() {
        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            console.warn('Razorpay API keys not found in environment variables.');
        }

        this.instance = new Razorpay({
            key_id: key_id || 'dummy',
            key_secret: key_secret || 'dummy',
        });
    }

    async createPaymentLink(
        amount: number,
        currency: string,
        description: string,
        customer: { name: string; email: string; contact: string }
    ) {
        try {
            const options = {
                amount: amount * 100, // Amount in smallest currency unit (e.g., paise)
                currency: currency,
                accept_partial: false,
                description: description,
                customer: {
                    name: customer.name,
                    email: customer.email,
                    contact: customer.contact,
                },
                notify: {
                    sms: true,
                    email: true,
                },
                reminder_enable: true,
                callback_url: 'https://google.com', // Default callback
                callback_method: 'get',
            };

            const paymentLink = await this.instance.paymentLink.create(options);
            return paymentLink;
        } catch (error) {
            console.error('Error creating payment link:', error);
            throw error;
        }
    }
}
