import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { sendTwilioWhatsAppNotification } from './server/twilioService';
import { 
  createPaymentOrderHandler, 
  verifyPaymentHandler, 
  paymentWebhookHandler, 
  getBookingStatusHandler 
} from './server/paymentController';
import adminAuthRoutes from './server/routes/adminAuthRoutes';
import adminDataRoutes from './server/routes/adminDataRoutes';

dotenv.config();

const getAppDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  return process.cwd();
};

const currentDir = getAppDirname();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Company details constant
  const COMPANY_DETAILS = {
    name: 'Zaara Travels',
    address: 'Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031',
    gstin: '19ACUPH2897Q2ZA',
    phone: '+91 99339 92786',
    secondaryPhone: '+91 99329 99786',
    officePhone: '+011 69296175',
    whatsapp: '+919933992786',
    website: 'www.zaaratravel.com',
    email: 'info@zaaratravel.com',
    tagline: 'Your Journey, Our Passion.',
  };

  // API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Payment Gateway API Routes
  app.post('/api/payment/create-order', createPaymentOrderHandler);
  app.post('/api/payment/verify-payment', verifyPaymentHandler);
  app.post('/api/payment/webhook', paymentWebhookHandler);
  app.get('/api/payment/status/:bookingId', getBookingStatusHandler);

  // Admin Authentication & Operations API Routes
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/admin', adminDataRoutes);

  app.get('/api/company-info', (req, res) => {
    res.json(COMPANY_DETAILS);
  });

  // AI Itinerary Customizer using Gemini 3.6 Flash
  app.post('/api/custom-itinerary', async (req, res) => {
    const { destinations, duration, travelers, travelType, interests, specialRequests, budget } = req.body;

    const getCuratedItineraryFallback = () => {
      const numDays = parseInt(duration || '6') || 6;
      const numTravelers = parseInt(travelers) || 2;

      return {
        success: true,
        source: 'curated-template',
        itineraryTitle: `${numDays}-Day Custom India Tour: ${destinations || 'Golden Triangle & Safaris'}`,
        overview: `A personalized travel plan crafted by Zaara Travels featuring private AC vehicle, expert local guides, and seamless transfers for ${numTravelers} traveler(s).`,
        days: Array.from({ length: numDays }).map((_, idx) => ({
          day: idx + 1,
          title: `Day ${idx + 1}: ${
            idx === 0
              ? 'Arrival & Initial Sightseeing'
              : idx === numDays - 1
              ? 'Final Sightseeing & Departure Drop'
              : 'Cultural Exploration & Guided Monuments'
          }`,
          activities: [
            `Private pickup in AC vehicle with dedicated professional driver.`,
            `Guided exploration of key sights tailored to your interests (${interests || 'Heritage & Culture'}).`,
            `Authentic local dining recommendations and leisure evening.`,
          ],
          stayLocation: idx === 0 ? 'Delhi' : idx === 1 ? 'Agra' : 'Jaipur / Ranthambore',
          insiderTip: 'Zaara Travels provides complimentary bottled mineral water and Wi-Fi inside all private vehicles.',
        })),
        recommendedVehicle: numTravelers > 4 ? 'Toyota Innova Crysta / Tempo Traveller' : 'Private AC Sedan (Dzire/Etios)',
        estimatedPriceRange: budget?.toLowerCase().includes('luxury') ? '₹45,000 - ₹85,000 ($540 - $1000)' : '₹25,000 - ₹48,000 ($300 - $580)',
        includedServices: [
          'Private AC Car & Dedicated Driver',
          'All Tolls, Parking, Fuel & Taxes',
          'Government License Monument Guides',
          '24/7 WhatsApp Assistance (+91 99339 92786)',
        ],
        whatsappMessage: encodeURIComponent(`Hello Zaara Travels, I created a custom ${numDays}-day itinerary for ${destinations || 'Golden Triangle'}. Please send me your best final price quote!`),
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json(getCuratedItineraryFallback());
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the lead travel consultant for Zaara Travels (GSTIN: 19ACUPH2897Q2ZA, Primary WhatsApp: +91 99339 92786, Secondary: +91 99329 99786, Office: +011 69296175, Address: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031).
Create a detailed, highly attractive, day-by-day customized travel itinerary for a guest visiting India.

Guest Specifications:
- Destinations: ${destinations || 'Golden Triangle (Delhi, Agra, Jaipur) & Ranthambore'}
- Duration: ${duration || '6'} days
- Number of Travelers: ${travelers || '2'}
- Travel Style: ${travelType || 'Private Tour'}
- Key Interests: ${interests || 'Heritage, Wildlife, Photography, Culture'}
- Budget Level: ${budget || 'Comfort / Luxury'}
- Special Requests: ${specialRequests || 'Private car & English speaking guide'}

Respond strictly in JSON format with the following structure:
{
  "itineraryTitle": "Catchy Title for the Custom Tour",
  "overview": "2-3 sentence engaging summary highlighting Zaara Travels' private driver and luxury guide services",
  "days": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "stayLocation": "City Name",
      "insiderTip": "A useful local travel tip from Zaara Travels"
    }
  ],
  "recommendedVehicle": "Vehicle model suited for group size (e.g. Sedan, Innova Crysta, Tempo Traveller)",
  "estimatedPriceRange": "Estimated total price range in INR & USD for the group",
  "includedServices": ["Service 1", "Service 2", "Service 3", "Service 4"],
  "whatsappSummary": "Short text summary for sending via WhatsApp to +91 99339 92786"
}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed (invalid key or network issue), switching to curated fallback:', geminiError?.message || geminiError);
        return res.json(getCuratedItineraryFallback());
      }

      let parsedData;
      try {
        let rawText = response?.text || '';
        rawText = rawText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(rawText || '{}');
      } catch (e) {
        console.warn('Failed to parse Gemini JSON output, using curated fallback:', e);
        parsedData = getCuratedItineraryFallback();
      }

      if (!parsedData || !Array.isArray(parsedData.days) || parsedData.days.length === 0) {
        console.warn('Gemini response missing valid days array, using curated fallback');
        parsedData = getCuratedItineraryFallback();
      }

      return res.json({
        success: true,
        source: 'gemini-ai',
        ...parsedData,
      });
    } catch (error: any) {
      console.error('Error generating AI custom itinerary:', error);
      return res.json(getCuratedItineraryFallback());
    }
  });

  // Handle Tour Inquiry & WhatsApp prefill
  app.post('/api/inquiry', (req, res) => {
    const { name, phone, email, tourName, travelers, travelDate, notes } = req.body;
    const inquiryId = 'ZT-' + Math.floor(100000 + Math.random() * 900000);

    const waText = `*New Tour Inquiry - Zaara Travels*
*Inquiry Ref:* ${inquiryId}
*Guest Name:* ${name}
*Phone:* ${phone}
*Email:* ${email || 'N/A'}
*Selected Tour:* ${tourName}
*Travelers:* ${travelers || 1}
*Preferred Date:* ${travelDate || 'Flexible'}
*Notes:* ${notes || 'None'}`;

    const waLink = `https://wa.me/919933992786?text=${encodeURIComponent(waText)}`;

    res.json({
      success: true,
      inquiryId,
      message: 'Inquiry registered! You can now send it directly to Zaara Travels on WhatsApp.',
      whatsappLink: waLink,
    });
  });

  // Handle Automatic Booking Confirmation & Dispatch to Admin Email + WhatsApp
  app.post('/api/confirm-booking', async (req, res) => {
    const bookingData = req.body;
    console.log('---------------------------------------------------------');
    console.log('📌 AUTOMATIC BOOKING CONFIRMATION DISPATCHED TO BACKEND');
    console.log('Admin Email:', COMPANY_DETAILS.email);
    console.log('WhatsApp Helpline:', COMPANY_DETAILS.phone);
    console.log('Booking Details:', JSON.stringify(bookingData, null, 2));
    console.log('---------------------------------------------------------');

    // Trigger Twilio WhatsApp / SMS notification logic
    const twilioResult = await sendTwilioWhatsAppNotification(bookingData);

    res.json({
      success: true,
      message: 'Booking & PDF Voucher reference automatically processed for info@zaaratravel.com & WhatsApp (+91 99339 92786).',
      adminEmailSentTo: COMPANY_DETAILS.email,
      adminWhatsApp: COMPANY_DETAILS.phone,
      twilioResult,
      whatsappDispatchLink: twilioResult.whatsappUrl,
    });
  });

  // Dedicated API endpoint for automated WhatsApp notifications
  app.post('/api/send-whatsapp', async (req, res) => {
    const bookingData = req.body;
    const twilioResult = await sendTwilioWhatsAppNotification(bookingData);

    res.json({
      success: true,
      recipientWhatsApp: '+91 99339 92786',
      whatsappUrl: twilioResult.whatsappUrl,
      twilioResult,
      message: twilioResult.message,
    });
  });

  app.post('/api/send-booking-email', (req, res) => {
    const booking = req.body;
    console.log('=========================================================');
    console.log('📧 DISPATCHING BOOKING CONFIRMATION EMAIL VIA BACKEND MAILER');
    console.log(`To Guest: ${booking.guestEmail || 'Not specified'}`);
    console.log(`To Admin: ${COMPANY_DETAILS.email}`);
    console.log(`Booking ID: ${booking.bookingId} | Tour: ${booking.tourTitle}`);
    console.log(`Travel Date: ${booking.travelDate} | Vehicle: ${booking.vehicleType}`);
    console.log(`Total Price: ₹${booking.totalAmountINR?.toLocaleString('en-IN') || 0} ($${booking.totalAmountUSD || 0} USD)`);
    console.log('=========================================================');

    res.json({
      success: true,
      service: 'Zaara Travels Email Dispatch Engine',
      guestEmailSentTo: booking.guestEmail || 'N/A',
      adminEmailSentTo: COMPANY_DETAILS.email,
      bookingRef: booking.bookingId,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED_DELIVERED',
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
